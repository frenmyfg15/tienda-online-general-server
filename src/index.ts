import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { PaymentController } from "./controllers/payment.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --------------------------
// 1) CORS
// --------------------------
app.use(cors());

// ---------------------------------------------------------
// 2) STRIPE WEBHOOK — **DEBE IR ANTES DE express.json()**
// ---------------------------------------------------------
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);

// ---------------------------------------------------------
// 3) JSON NORMAL PARA EL RESTO DE LA API
// ---------------------------------------------------------
app.use(express.json());

// --------------------------
// 4) RUTAS
// --------------------------
app.use("/api", routes);
app.use("/api/admin", adminRoutes);

// --------------------------
// 5) ERROR HANDLER
// --------------------------
app.use(errorMiddleware);

// --------------------------
// 6) SERVER START
// --------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📡 Webhook listening at: POST /api/payment/webhook");
});
