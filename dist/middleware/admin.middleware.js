"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    next();
};
exports.isAdmin = isAdmin;
