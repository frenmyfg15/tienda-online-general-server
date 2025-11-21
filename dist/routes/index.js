"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const address_routes_1 = __importDefault(require("./address.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/user", user_routes_1.default);
router.use("/products", product_routes_1.default);
router.use("/categories", category_routes_1.default);
router.use("/cart", cart_routes_1.default);
router.use("/orders", order_routes_1.default);
router.use("/addresses", address_routes_1.default);
router.use("/admin", admin_routes_1.default);
exports.default = router;
