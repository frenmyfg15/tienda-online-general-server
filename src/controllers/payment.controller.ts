// 4) PaymentController: leer addressId del body
// src/controllers/payment.controller.ts

import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();

export class PaymentController {
  static async createCheckoutSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const { addressId } = req.body;

      const result = await paymentService.createCheckoutSession(
        userId,
        Number(addressId)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
