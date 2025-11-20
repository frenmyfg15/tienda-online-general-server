import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/random", ProductController.getRandom);
router.get("/search", ProductController.search);
router.get("/:id", ProductController.getById);

export default router;
