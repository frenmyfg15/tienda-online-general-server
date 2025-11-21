"use strict";
// src/services/order.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cart_services_1 = require("./cart.services");
class OrderService {
    constructor() {
        this.cartService = new cart_services_1.CartService();
    }
    async createOrder(userId, addressId) {
        const cart = await this.cartService.getCart(userId);
        if (!cart.items.length) {
            const error = new Error("Cart is empty");
            error.status = 400;
            throw error;
        }
        const address = await client_1.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address || address.userId !== userId) {
            const error = new Error("Invalid address");
            error.status = 400;
            throw error;
        }
        const total = cart.total;
        const order = await client_1.prisma.order.create({
            data: {
                userId,
                addressId,
                total,
                status: "PENDING",
                paymentStatus: "PENDING",
                currency: "EUR",
            },
        });
        for (const item of cart.items) {
            await client_1.prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price, // <- CORREGIDO: unitPrice en lugar de price
                },
            });
            await client_1.prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }
        await this.cartService.clearCart(userId);
        const fullOrder = await client_1.prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
        return fullOrder;
    }
    async getUserOrders(userId) {
        return client_1.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
    }
    async getOrderById(id) {
        const order = await client_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
        if (!order) {
            const error = new Error("Order not found");
            error.status = 404;
            throw error;
        }
        return order;
    }
}
exports.OrderService = OrderService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], OrderService.prototype, "createOrder", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], OrderService.prototype, "getUserOrders", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], OrderService.prototype, "getOrderById", null);
