// src/services/order.services.ts

import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";
import { CartService } from "./cart.services";

export class OrderService {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  @ServiceError()
  async createOrder(userId: number, addressId: number) {
    console.log("🧾 [OrderService] createOrder called for user:", userId, "addressId:", addressId);

    const cart = await this.cartService.getCart(userId);

    console.log("🛒 [OrderService] Cart items:", JSON.stringify(cart.items, null, 2));
    console.log("💰 [OrderService] Cart total:", cart.total);

    if (!cart.items.length) {
      const error: any = new Error("Cart is empty");
      error.status = 400;
      console.error("⚠️ [OrderService] Cart is empty, aborting order creation");
      throw error;
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    console.log("📬 [OrderService] Address found:", address);

    if (!address || address.userId !== userId) {
      const error: any = new Error("Invalid address");
      error.status = 400;
      console.error("⚠️ [OrderService] Invalid address for user:", userId);
      throw error;
    }

    const total = cart.total;

    console.log("🧮 [OrderService] Proceeding to create order with total:", total);

    // 🔒 Transacción: pedido + items + actualización de stock
    const order = await prisma.$transaction(async (tx) => {
      // 1) Comprobar stock de todos los productos del carrito
      const productIds = cart.items.map((i) => i.productId);

      console.log("📦 [OrderService] Product IDs in cart:", productIds);

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true },
      });

      console.log("📊 [OrderService] Current stock for products:", products);

      const stockMap = new Map(
        products.map((p) => [p.id, { stock: p.stock, name: p.name }])
      );

      for (const item of cart.items) {
        const p = stockMap.get(item.productId);
        if (!p) {
          const error: any = new Error(`Product ${item.productId} not found`);
          error.status = 400;
          console.error(
            "❌ [OrderService] Product not found when creating order. productId:",
            item.productId
          );
          throw error;
        }

        console.log(
          `🔍 [OrderService] Checking stock for "${p.name}" (id=${item.productId}). Current stock=${p.stock}, requested=${item.quantity}`
        );

        if (p.stock < item.quantity) {
          const error: any = new Error(
            `Not enough stock for "${p.name}". Available: ${p.stock}, requested: ${item.quantity}`
          );
          error.status = 400;
          console.error("❌ [OrderService] Not enough stock:", {
            productId: item.productId,
            name: p.name,
            stock: p.stock,
            requested: item.quantity,
          });
          throw error;
        }
      }

      // 2) Crear pedido
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          total,
          status: "PENDING",
          paymentStatus: "PENDING",
          currency: "EUR",
        },
      });

      console.log("✅ [OrderService] Order created with id:", createdOrder.id);

      // 3) Crear items + restar stock
      for (const item of cart.items) {
        console.log(
          `🧩 [OrderService] Creating orderItem for productId=${item.productId}, quantity=${item.quantity}, unitPrice=${item.price}`
        );

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          },
        });

        console.log(
          `📉 [OrderService] Decrementing stock for productId=${item.productId} by quantity=${item.quantity}`
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

      console.log("✅ [OrderService] Order items created and stock decremented");

      return createdOrder;
    });

    console.log("🧹 [OrderService] Clearing cart for user:", userId);
    // 4) Vaciar carrito fuera de la transacción
    await this.cartService.clearCart(userId);

    console.log("🔁 [OrderService] Fetching full order with relations. orderId:", order.id);

    // 5) Devolver pedido completo
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    console.log("📦 [OrderService] Full order:", JSON.stringify(fullOrder, null, 2));

    return fullOrder;
  }

  @ServiceError()
  async getUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });
  }

  @ServiceError()
  async getOrderById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      const error: any = new Error("Order not found");
      error.status = 404;
      console.error("❌ [OrderService] Order not found. id:", id);
      throw error;
    }

    return order;
  }
}
