// src/services/order.service.ts

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
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      const error: any = new Error("Cart is empty");
      error.status = 400;
      throw error;
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      const error: any = new Error("Invalid address");
      error.status = 400;
      throw error;
    }

    const total = cart.total;

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        currency: "EUR",
      },
    });

    for (const item of cart.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price, // <- CORREGIDO: unitPrice en lugar de price
        },
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await this.cartService.clearCart(userId);

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
      throw error;
    }

    return order;
  }
}
