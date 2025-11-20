import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 Controller Error:", err);

  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
