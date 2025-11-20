import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authRequired, OrderController.createOrder);
router.get("/", authRequired, OrderController.getUserOrders);
router.get("/:id", authRequired, OrderController.getById);

export default router;
