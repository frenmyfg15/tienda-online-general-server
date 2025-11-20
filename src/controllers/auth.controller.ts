import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.services";

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const result = await authService.register({ email, password, name });

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
