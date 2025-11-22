import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { OrderService } from "../services/order.services";

const orderService = new OrderService();

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const addressId = req.body.addressId;

      console.log("🟦 [OrderController] createOrder() called");
      console.log("   → userId:", userId);
      console.log("   → addressId:", addressId);

      const order = await orderService.createOrder(userId, addressId);

      console.log("✅ [OrderController] Order created successfully:", order?.id);

      return res.status(201).json(order);
    } catch (error) {
      console.error("❌ [OrderController] Error in createOrder:", error);
      next(error);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      console.log("🟦 [OrderController] getUserOrders() userId:", userId);

      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      return res.json(orders);
    } catch (error) {
      console.error("❌ [OrderController] Error in getUserOrders:", error);
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      console.log("🟦 [OrderController] getById() id:", id);

      const order = await orderService.getOrderById(id);

      return res.json(order);
    } catch (error) {
      console.error("❌ [OrderController] Error in getById:", error);
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("🟦 [OrderController] getAll()");

      const orders = await prisma.order.findMany({
        include: {
          user: true,
          items: { include: { product: true } },
          address: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json(orders);
    } catch (error) {
      console.error("❌ [OrderController] Error in getAll:", error);
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status, cancelReason } = req.body;

      console.log("🟦 [OrderController] updateStatus()");
      console.log("   → id:", id);
      console.log("   → status:", status);
      console.log("   → cancelReason:", cancelReason);

      const updated = await prisma.order.update({
        where: { id },
        data: { status, cancelReason },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
      });

      return res.json(updated);
    } catch (error) {
      console.error("❌ [OrderController] Error in updateStatus:", error);
      next(error);
    }
  }
}
