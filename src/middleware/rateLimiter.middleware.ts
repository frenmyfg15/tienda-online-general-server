import { Request, Response, NextFunction } from "express";

const rateMap = new Map<string, { count: number; last: number }>();

export const rateLimiter =
  (limit: number, windowMs: number) =>
  (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();

    const entry = rateMap.get(ip as any);

    if (!entry) {
      rateMap.set(ip as any, { count: 1, last: now });
      return next();
    }

    if (now - entry.last > windowMs) {
      rateMap.set(ip as any, { count: 1, last: now });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    entry.count++;
    next();
  };
