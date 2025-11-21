"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rateMap = new Map();
const rateLimiter = (limit, windowMs) => (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const entry = rateMap.get(ip);
    if (!entry) {
        rateMap.set(ip, { count: 1, last: now });
        return next();
    }
    if (now - entry.last > windowMs) {
        rateMap.set(ip, { count: 1, last: now });
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
exports.rateLimiter = rateLimiter;
