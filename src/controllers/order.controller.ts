import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { OrderService } from "../services/order.services";

const orderService = new OrderService();

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const order = await orderService.createOrder(userId, req.body.addressId);
      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

    static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await orderService.getOrderById(id);
      return res.json(order);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
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
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status, cancelReason } = req.body;

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
      next(error);
    }
  }

}
