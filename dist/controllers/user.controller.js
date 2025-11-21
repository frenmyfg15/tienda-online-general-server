"use strict";
// src/controllers/user.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const client_1 = require("../prisma/client");
const hash_1 = require("../utils/hash");
class UserController {
    // ADMIN: crear usuario (admin o normal)
    static async createUser(req, res, next) {
        try {
            const { email, password, name, role } = req.body;
            const hashed = await (0, hash_1.hashPassword)(password);
            const user = await client_1.prisma.user.create({
                data: { email, password: hashed, name, role },
            });
            return res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    // ADMIN: obtener todos los usuarios
    static async getAllUsers(req, res, next) {
        try {
            const users = await client_1.prisma.user.findMany({
                select: { id: true, email: true, name: true, role: true, createdAt: true },
            });
            return res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    // USER: obtener perfil propio
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await client_1.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true, role: true, createdAt: true },
            });
            return res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    // USER: actualizar perfil propio
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, password } = req.body;
            let data = { name };
            if (password) {
                data.password = await (0, hash_1.hashPassword)(password);
            }
            const updated = await client_1.prisma.user.update({
                where: { id: userId },
                data,
                select: { id: true, email: true, name: true, role: true, createdAt: true },
            });
            return res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
