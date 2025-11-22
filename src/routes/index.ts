import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import addressRoutes from "./address.routes";
import adminRoutes from "./admin.routes";
import paymentRoutes from "./payment.routes";

const router = Router();

// Middleware para LOG de ruta global
router.use((req, res, next) => {
  console.log(`📢 [ROUTER] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Logs por cada grupo de rutas
router.use("/auth", (req, res, next) => { 
  console.log("➡️ /auth route"); 
  next(); 
}, authRoutes);

router.use("/user", (req, res, next) => { 
  console.log("➡️ /user route"); 
  next(); 
}, userRoutes);

router.use("/products", (req, res, next) => { 
  console.log("➡️ /products route"); 
  next(); 
}, productRoutes);

router.use("/categories", (req, res, next) => { 
  console.log("➡️ /categories route"); 
  next(); 
}, categoryRoutes);

router.use("/cart", (req, res, next) => { 
  console.log("➡️ /cart route"); 
  next(); 
}, cartRoutes);

router.use("/orders", (req, res, next) => { 
  console.log("➡️ /orders route"); 
  next(); 
}, orderRoutes);

router.use("/addresses", (req, res, next) => { 
  console.log("➡️ /addresses route"); 
  next(); 
}, addressRoutes);

router.use("/admin", (req, res, next) => { 
  console.log("➡️ /admin route"); 
  next(); 
}, adminRoutes);

router.use("/payment", (req, res, next) => { 
  console.log("➡️ /payment route"); 
  next(); 
}, paymentRoutes);

export default router;
