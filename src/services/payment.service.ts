// src/services/payment.service.ts

import Stripe from "stripe";
import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";
import { CartService } from "./cart.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type CartSnapshotItem = {
  productId: number;
  quantity: number;
};

export class PaymentService {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  /**
   * 1) Solo crea la sesión de Stripe.
   * NO crea el pedido.
   * NO descuenta stock.
   * Guarda un snapshot del carrito en metadata.
   */
  @ServiceError()
  async createCheckoutSession(userId: number, addressId: number) {
    console.log("🟦 [PaymentService] createCheckoutSession", {
      userId,
      addressId,
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      const err: any = new Error("Usuario no encontrado");
      err.status = 400;
      throw err;
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      const err: any = new Error("Dirección no válida");
      err.status = 400;
      throw err;
    }

    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      const err: any = new Error("El carrito está vacío");
      err.status = 400;
      throw err;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    // Snapshot minimal del carrito para recrear el pedido en el webhook
    const snapshot: CartSnapshotItem[] = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: {
        userId: String(userId),
        addressId: String(addressId),
        cart: JSON.stringify(snapshot), // OJO: tamaño limitado, pero para carritos pequeños vale
      },
    });

    console.log("💳 [PaymentService] Stripe session created:", {
      sessionId: session.id,
      payment_intent: session.payment_intent,
    });

    // ⛔️ Aquí YA NO se crea pedido ni se limpia el carrito
    return { url: session.url };
  }

  /**
   * 2) Se llama desde el webhook cuando Stripe confirma el pago.
   * Aquí SÍ se crea el pedido, se restan stocks y se limpia el carrito.
   */
  @ServiceError()
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log("🟦 [PaymentService] handleCheckoutSessionCompleted", {
      sessionId: session.id,
    });

    const metadata = session.metadata || {};
    const userId = Number(metadata.userId);
    const addressId = Number(metadata.addressId);
    const rawCart = metadata.cart;

    if (!userId || !addressId || !rawCart) {
      const err: any = new Error(
        "Faltan metadatos para crear el pedido (userId/addressId/cart)"
      );
      err.status = 400;
      throw err;
    }

    let cartItems: CartSnapshotItem[];
    try {
      cartItems = JSON.parse(rawCart) as CartSnapshotItem[];
    } catch (e) {
      const err: any = new Error("No se pudo parsear el carrito desde metadata");
      err.status = 400;
      throw err;
    }

    if (!cartItems.length) {
      const err: any = new Error("El carrito en metadata está vacío");
      err.status = 400;
      throw err;
    }

    const productIds = cartItems.map((i) => i.productId);

    // Obtenemos precios y stock actual
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, price: true, name: true },
    });

    const productMap = new Map(
      products.map((p) => [
        p.id,
        { stock: p.stock, price: p.price, name: p.name },
      ])
    );

    // Comprobar stock y calcular total
    let total = 0;

    for (const item of cartItems) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        const err: any = new Error(
          `Producto ${item.productId} no encontrado al confirmar pago`
        );
        err.status = 400;
        throw err;
      }

      if (prod.stock < item.quantity) {
        const err: any = new Error(
          `Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}, solicitado: ${item.quantity}`
        );
        err.status = 400;
        throw err;
      }

      total += prod.price * item.quantity;
    }

    // Crear pedido + items + restar stock + limpiar carrito, TODO en transacción
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          total,
          status: "PROCESSING",
          paymentStatus: "PAID",
          currency: "EUR",
          items: {
            create: cartItems.map((item) => {
              const prod = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: prod.price,
              };
            }),
          },
        },
      });

      for (const item of cartItems) {
        const prod = productMap.get(item.productId)!;
        console.log(
          `📉 [PaymentService] Decrement stock: productId=${item.productId}, qty=${item.quantity} (stock actual=${prod.stock})`
        );

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Limpiar carrito de ese usuario
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return createdOrder;
    });

    console.log("✅ [PaymentService] Order created from webhook:", order.id);

    return order;
  }
}
