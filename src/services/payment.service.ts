// 3) PaymentService: ahora exige addressId y la vincula al pedido
// src/services/payment.service.ts

import Stripe from "stripe";
import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";
import { CartService } from "./cart.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export class PaymentService {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  @ServiceError()
  async createCheckoutSession(userId: number, addressId: number) {
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

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        total: cart.total,
        status: "PENDING",
        paymentStatus: "PENDING",
        currency: "EUR",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success?orderId=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel?orderId=${order.id}`,
      metadata: {
        orderId: String(order.id),
        userId: String(userId),
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: (session.payment_intent as string) ?? null,
        paymentStatus: "REQUIRES_PAYMENT",
      },
    });

    // opcional: vaciar carrito tras crear orden
    await this.cartService.clearCart(userId);

    return {
      url: session.url,
    };
  }

  @ServiceError()
  async markOrderPaid(orderId: number) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
      },
    });
  }
}
