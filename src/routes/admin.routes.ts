// src/routes/admin.routes.ts
import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { CategoryController } from "../controllers/category.controller";
import { OrderController } from "../controllers/order.controller";
import { UserController } from "../controllers/user.controller";
import { authRequired } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";
import { uploadImages } from "../middleware/uploadImages";

const router = Router();

// Todas las rutas de admin requieren estar logueado y ser admin
router.use(authRequired, isAdmin);

// Productos
router.get("/products", ProductController.getAll);
router.get("/products/:id", ProductController.getById); // 👈 para cargar en edición
router.post("/products", uploadImages, ProductController.create);
router.put("/products/:id", uploadImages, ProductController.update); // 👈 actualizar
router.patch("/products/:id/status", ProductController.updateStatus);

// Categorías
router.get("/categories", CategoryController.getAll);
router.post("/categories", CategoryController.create);

// Pedidos
router.get("/orders", OrderController.getAll);
router.patch("/orders/:id/status", OrderController.updateStatus);

// Usuarios (gestión desde panel admin)
router.get("/users", UserController.getAllUsers);
router.post("/users", UserController.createUser);

export default router;
