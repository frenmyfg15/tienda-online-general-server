"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_services_1 = require("../services/auth.services");
const authService = new auth_services_1.AuthService();
class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const result = await authService.register({ email, password, name });
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
