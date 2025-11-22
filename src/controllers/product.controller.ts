// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.services";

const productService = new ProductService();

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await productService.getAllProducts();
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async getRandom(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await productService.getRandomProducts();
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const r = await productService.getProductById(id);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const r = await productService.searchProducts(q);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req.files as Express.Multer.File[]) ?? [];
      const data = req.body;

      const r = await productService.createProduct(data, files);
      res.status(201).json(r);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const files = (req.files as Express.Multer.File[]) ?? [];
      const data = req.body;

      const r = await productService.updateProduct(id, data, files);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;
      const r = await productService.setProductStatus(id, Boolean(isActive));
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
}
