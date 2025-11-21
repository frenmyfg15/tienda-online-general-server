"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.routes.ts
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const category_controller_1 = require("../controllers/category.controller");
const order_controller_1 = require("../controllers/order.controller");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Todas las rutas de admin requieren estar logueado y ser admin
router.use(auth_middleware_1.authRequired, admin_middleware_1.isAdmin);
// Productos
router.get("/products", product_controller_1.ProductController.getAll);
router.post("/products", product_controller_1.ProductController.create);
router.patch("/products/:id/status", product_controller_1.ProductController.updateStatus);
// Categorías
router.get("/categories", category_controller_1.CategoryController.getAll);
router.post("/categories", category_controller_1.CategoryController.create);
// Pedidos
router.get("/orders", order_controller_1.OrderController.getAll);
router.patch("/orders/:id/status", order_controller_1.OrderController.updateStatus);
// Usuarios (gestión desde panel admin)
router.get("/users", user_controller_1.UserController.getAllUsers);
router.post("/users", user_controller_1.UserController.createUser);
exports.default = router;
