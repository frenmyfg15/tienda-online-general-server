// src/services/cart.service.ts

import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

export class CartService {
  @ServiceError()
  async getCart(userId: number) {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const mapped = items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const total = mapped.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    return {
      items: mapped,
      total,
    };
  }

  @ServiceError()
  async addToCart(userId: number, productId: number, quantity = 1) {
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: {
          quantity: existing.quantity + quantity,
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
  }

  @ServiceError()
  async updateItem(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    return prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
    });
  }

  @ServiceError()
  async removeItem(userId: number, productId: number) {
    return prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  @ServiceError()
  async clearCart(userId: number) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
