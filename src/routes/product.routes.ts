// src/routes/product.routes.ts
import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { uploadImages } from "../middleware/uploadImages";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/random", ProductController.getRandom);
router.get("/search", ProductController.search);
router.get("/:id", ProductController.getById);

router.post("/", uploadImages, ProductController.create);

export default router;
