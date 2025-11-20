// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { hashPassword } from "../utils/hash";

export class UserController {
  // ADMIN: crear usuario (admin o normal)
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;
      const hashed = await hashPassword(password);

      const user = await prisma.user.create({
        data: { email, password: hashed, name, role },
      });

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  // ADMIN: obtener todos los usuarios
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // USER: obtener perfil propio
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // USER: actualizar perfil propio
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { name, password } = req.body;

      let data: any = { name };

      if (password) {
        data.password = await hashPassword(password);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });

      return res.json(updated);
    } catch (error) {
      next(error);
    }
  }
}
