"use strict";
// src/controllers/payment.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const payment_service_1 = require("../services/payment.service");
const paymentService = new payment_service_1.PaymentService();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
class PaymentController {
    static async createCheckoutSession(req, res, next) {
        try {
            const userId = req.user.id;
            const { addressId } = req.body;
            console.log("🟦 [PaymentController] createCheckoutSession", {
                userId,
                addressId,
            });
            const result = await paymentService.createCheckoutSession(userId, Number(addressId));
            res.json(result);
        }
        catch (error) {
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
    static async handleWebhook(req, res) {
        const sig = req.headers["stripe-signature"];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, // RAW body
            sig, webhookSecret);
        }
        catch (err) {
            console.error("❌ [PaymentController] Webhook signature error:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        console.log("📩 [PaymentController] Webhook event:", event.type);
        try {
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                await paymentService.handleCheckoutSessionCompleted(session);
            }
            else {
                console.log("ℹ️ [PaymentController] Webhook event no manejado:", event.type);
            }
            res.json({ received: true });
        }
        catch (err) {
            console.error("❌ [PaymentController] Error processing webhook:", err);
            res.status(500).send("Webhook handler failed");
        }
    }
}
exports.PaymentController = PaymentController;
