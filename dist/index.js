"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const payment_controller_1 = require("./controllers/payment.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// --------------------------
// 1) CORS
// --------------------------
app.use((0, cors_1.default)());
// ---------------------------------------------------------
// 2) STRIPE WEBHOOK — **DEBE IR ANTES DE express.json()**
// ---------------------------------------------------------
app.post("/api/payment/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.PaymentController.handleWebhook);
// ---------------------------------------------------------
// 3) JSON NORMAL PARA EL RESTO DE LA API
// ---------------------------------------------------------
app.use(express_1.default.json());
// --------------------------
// 4) RUTAS
// --------------------------
app.use("/api", routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// --------------------------
// 5) ERROR HANDLER
// --------------------------
app.use(error_middleware_1.errorMiddleware);
// --------------------------
// 6) SERVER START
// --------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📡 Webhook listening at: POST /api/payment/webhook");
});
