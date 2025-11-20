import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { rateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", rateLimiter(5, 60_000), AuthController.login);

export default router;
