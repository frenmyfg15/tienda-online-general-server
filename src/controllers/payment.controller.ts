// src/controllers/payment.controller.ts

import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export class PaymentController {
  static async createCheckoutSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const { addressId } = req.body;

      console.log("🟦 [PaymentController] createCheckoutSession", {
        userId,
        addressId,
      });

      const result = await paymentService.createCheckoutSession(
        userId,
        Number(addressId)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook de Stripe:
   * - Recibe eventos (checkout.session.completed, etc.)
   * - Cuando se completa el pago, creamos el pedido y restamos stock.
   *
   * IMPORTANTE:
   *   req.body aquí es el RAW body (Buffer), NO JSON parseado.
   */
  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // RAW body
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error("❌ [PaymentController] Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("📩 [PaymentController] Webhook event:", event.type);

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        await paymentService.handleCheckoutSessionCompleted(session);
      } else {
        console.log(
          "ℹ️ [PaymentController] Webhook event no manejado:",
          event.type
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ [PaymentController] Error processing webhook:", err);
      res.status(500).send("Webhook handler failed");
    }
  }
}
