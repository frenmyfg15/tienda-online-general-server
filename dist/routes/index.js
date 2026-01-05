"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const address_routes_1 = __importDefault(require("./address.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const router = (0, express_1.Router)();
// Middleware para LOG de ruta global
router.use((req, res, next) => {
    console.log(`📢 [ROUTER] Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});
// Logs por cada grupo de rutas
router.use("/auth", (req, res, next) => {
    console.log("➡️ /auth route");
    next();
}, auth_routes_1.default);
router.use("/user", (req, res, next) => {
    console.log("➡️ /user route");
    next();
}, user_routes_1.default);
router.use("/products", (req, res, next) => {
    console.log("➡️ /products route");
    next();
}, product_routes_1.default);
router.use("/categories", (req, res, next) => {
    console.log("➡️ /categories route");
    next();
}, category_routes_1.default);
router.use("/cart", (req, res, next) => {
    console.log("➡️ /cart route");
    next();
}, cart_routes_1.default);
router.use("/orders", (req, res, next) => {
    console.log("➡️ /orders route");
    next();
}, order_routes_1.default);
router.use("/addresses", (req, res, next) => {
    console.log("➡️ /addresses route");
    next();
}, address_routes_1.default);
router.use("/admin", (req, res, next) => {
    console.log("➡️ /admin route");
    next();
}, admin_routes_1.default);
router.use("/payment", (req, res, next) => {
    console.log("➡️ /payment route");
    next();
}, payment_routes_1.default);
exports.default = router;
