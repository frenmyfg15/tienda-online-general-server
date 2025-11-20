import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authRequired, CartController.getCart);
router.post("/add", authRequired, CartController.addToCart);
router.put("/", authRequired, CartController.updateItem);
router.delete("/:productId", authRequired, CartController.removeItem);

export default router;
