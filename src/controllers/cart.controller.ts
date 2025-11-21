// src/controllers/cart.controller.ts

import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";

const cartService = new CartService();

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity } = req.body;
      await cartService.addToCart(userId, Number(productId), Number(quantity || 1));
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity } = req.body;
      await cartService.updateItem(userId, Number(productId), Number(quantity));
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const productId = Number(req.params.productId);
      await cartService.removeItem(userId, productId);
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await cartService.clearCart(userId);
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
}
