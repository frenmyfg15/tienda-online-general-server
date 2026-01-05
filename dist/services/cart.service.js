"use strict";
// src/services/cart.services.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
class CartService {
    async getCart(userId) {
        const items = await client_1.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
        const mapped = items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
        }));
        const total = mapped.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return {
            items: mapped,
            total,
        };
    }
    async addToCart(userId, productId, quantity = 1) {
        const existing = await client_1.prisma.cartItem.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (existing) {
            return client_1.prisma.cartItem.update({
                where: { userId_productId: { userId, productId } },
                data: {
                    quantity: existing.quantity + quantity,
                },
            });
        }
        return client_1.prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity,
            },
        });
    }
    async updateItem(userId, productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(userId, productId);
        }
        return client_1.prisma.cartItem.update({
            where: { userId_productId: { userId, productId } },
            data: { quantity },
        });
    }
    async removeItem(userId, productId) {
        return client_1.prisma.cartItem.delete({
            where: { userId_productId: { userId, productId } },
        });
    }
    async clearCart(userId) {
        await client_1.prisma.cartItem.deleteMany({
            where: { userId },
        });
    }
}
exports.CartService = CartService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "getCart", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "addToCart", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "updateItem", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "removeItem", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "clearCart", null);
