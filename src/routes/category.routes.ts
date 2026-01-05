import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

// Listar categorías
router.get("/", CategoryController.getAll);

// Obtener por ID
router.get("/:id", CategoryController.getById);

// Crear nueva categoría
router.post("/", CategoryController.create);

// Eliminar (solo si no tiene productos asociados)
router.delete("/:id", CategoryController.delete);

// Desactivar categoría
router.patch("/:id/deactivate", CategoryController.deactivate);

export default router;
