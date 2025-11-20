import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await prisma.category.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!category) {
        const err: any = new Error("Category not found");
        err.status = 404;
        throw err;
      }

      return res.json(category);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug } = req.body;

      const category = await prisma.category.create({
        data: { name, slug },
      });

      return res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
}
