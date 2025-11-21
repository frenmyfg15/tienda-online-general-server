"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = void 0;
const token_1 = require("../utils/token");
const authRequired = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token is required" });
    }
    const token = header.split(" ")[1];
    const payload = (0, token_1.validateToken)(token);
    if (!payload) {
        return res.status(401).json({ message: "Invalid token" });
    }
    req.user = payload;
    next();
};
exports.authRequired = authRequired;
