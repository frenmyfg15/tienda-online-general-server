import { Request, Response, NextFunction } from "express";
import { validateToken } from "../utils/token";

export const authRequired = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token is required" });
  }

  const token = header.split(" ")[1];
  const payload = validateToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid token" });
  }

  (req as any).user = payload;
  next();
};
