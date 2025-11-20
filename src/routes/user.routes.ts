// src/routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authRequired, UserController.getProfile);
router.put("/profile", authRequired, UserController.updateProfile);

export default router;
