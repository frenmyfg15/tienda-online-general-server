"use strict";
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
const carts = new Map();
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
class CartService {
    async getCart(userId) {
        const cart = carts.get(userId) || { items: [], total: 0 };
        return cart;
    }
    async addToCart(userId, productId, quantity = 1) {
        const product = await client_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            const error = new Error("Product not found");
            error.status = 404;
            throw error;
        }
        const current = carts.get(userId) || { items: [], total: 0 };
        const items = [...current.items];
        const index = items.findIndex((i) => i.productId === productId);
        if (index >= 0) {
            items[index].quantity += quantity;
        }
        else {
            items.push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
            });
        }
        const total = calculateTotal(items);
        const newCart = { items, total };
        carts.set(userId, newCart);
        return newCart;
    }
    async updateCartItem(userId, productId, quantity) {
        const current = carts.get(userId) || { items: [], total: 0 };
        const items = [...current.items];
        const index = items.findIndex((i) => i.productId === productId);
        if (index === -1) {
            const error = new Error("Item not found in cart");
            error.status = 404;
            throw error;
        }
        if (quantity <= 0) {
            items.splice(index, 1);
        }
        else {
            items[index].quantity = quantity;
        }
        const total = calculateTotal(items);
        const newCart = { items, total };
        carts.set(userId, newCart);
        return newCart;
    }
    async removeFromCart(userId, productId) {
        const current = carts.get(userId) || { items: [], total: 0 };
        const items = current.items.filter((i) => i.productId !== productId);
        const total = calculateTotal(items);
        const newCart = { items, total };
        carts.set(userId, newCart);
        return newCart;
    }
    async clearCart(userId) {
        carts.delete(userId);
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
], CartService.prototype, "updateCartItem", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "removeFromCart", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CartService.prototype, "clearCart", null);
