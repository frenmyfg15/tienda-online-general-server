"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// Listar categorías
router.get("/", category_controller_1.CategoryController.getAll);
// Obtener por ID
router.get("/:id", category_controller_1.CategoryController.getById);
// Crear nueva categoría
router.post("/", category_controller_1.CategoryController.create);
// Eliminar (solo si no tiene productos asociados)
router.delete("/:id", category_controller_1.CategoryController.delete);
// Desactivar categoría
router.patch("/:id/deactivate", category_controller_1.CategoryController.deactivate);
exports.default = router;
