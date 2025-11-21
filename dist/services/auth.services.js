"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("../prisma/client");
const hash_1 = require("../utils/hash");
const token_1 = require("../utils/token");
const errorHandler_1 = require("../utils/errorHandler");
class AuthService {
    async register(data) {
        const existing = await client_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            const error = new Error("Email already in use");
            error.status = 400;
            throw error;
        }
        const hashed = await (0, hash_1.hashPassword)(data.password);
        const user = await client_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashed,
                name: data.name,
                // role se queda por defecto en USER desde Prisma
            },
        });
        const token = (0, token_1.createToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }
    async login(data) {
        const user = await client_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }
        const isValid = await (0, hash_1.comparePassword)(data.password, user.password);
        if (!isValid) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }
        const token = (0, token_1.createToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }
}
exports.AuthService = AuthService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], AuthService.prototype, "register", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AuthService.prototype, "login", null);
