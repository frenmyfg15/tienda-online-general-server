"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, _req, res, _next) => {
    console.error("🔥 Controller Error:", err);
    return res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
};
exports.errorMiddleware = errorMiddleware;
