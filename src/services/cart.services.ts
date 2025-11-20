import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type Cart = {
  items: CartItem[];
  total: number;
};

const carts = new Map<number, Cart>();

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export class CartService {
  @ServiceError()
  async getCart(userId: number): Promise<Cart> {
    const cart = carts.get(userId) || { items: [], total: 0 };
    return cart;
  }

  @ServiceError()
  async addToCart(
    userId: number,
    productId: number,
    quantity: number = 1
  ): Promise<Cart> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const error: any = new Error("Product not found");
      error.status = 404;
      throw error;
    }

    const current = carts.get(userId) || { items: [], total: 0 };
    const items = [...current.items];

    const index = items.findIndex((i) => i.productId === productId);

    if (index >= 0) {
      items[index].quantity += quantity;
    } else {
      items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const total = calculateTotal(items);
    const newCart = { items, total };

    carts.set(userId, newCart);
    return newCart;
  }

  @ServiceError()
  async updateCartItem(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<Cart> {
    const current = carts.get(userId) || { items: [], total: 0 };
    const items = [...current.items];

    const index = items.findIndex((i) => i.productId === productId);

    if (index === -1) {
      const error: any = new Error("Item not found in cart");
      error.status = 404;
      throw error;
    }

    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = quantity;
    }

    const total = calculateTotal(items);
    const newCart = { items, total };

    carts.set(userId, newCart);
    return newCart;
  }

  @ServiceError()
  async removeFromCart(userId: number, productId: number): Promise<Cart> {
    const current = carts.get(userId) || { items: [], total: 0 };
    const items = current.items.filter((i) => i.productId !== productId);

    const total = calculateTotal(items);
    const newCart = { items, total };

    carts.set(userId, newCart);
    return newCart;
  }

  @ServiceError()
  async clearCart(userId: number): Promise<void> {
    carts.delete(userId);
  }
}
