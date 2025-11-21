// src/routes/payment.routes.ts

import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/checkout-session",
  authRequired,
  PaymentController.createCheckoutSession
);

export default router;
