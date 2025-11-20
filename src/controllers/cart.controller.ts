import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.services";

const cartService = new CartService();

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cart = await cartService.getCart(userId);

      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity } = req.body;

      const cart = await cartService.addToCart(userId, productId, quantity);

      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity } = req.body;

      const cart = await cartService.updateCartItem(
        userId,
        productId,
        quantity
      );

      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const productId = Number(req.params.productId);

      const cart = await cartService.removeFromCart(userId, productId);

      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }
}
