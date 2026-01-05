"use strict";
// src/routes/payment.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/checkout-session", auth_middleware_1.authRequired, payment_controller_1.PaymentController.createCheckoutSession);
exports.default = router;
