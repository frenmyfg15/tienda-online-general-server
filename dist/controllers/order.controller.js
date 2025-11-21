"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const client_1 = require("../prisma/client");
const order_services_1 = require("../services/order.services");
const orderService = new order_services_1.OrderService();
class OrderController {
    static async createOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const order = await orderService.createOrder(userId, req.body.addressId);
            return res.status(201).json(order);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const orders = await orderService.getUserOrders(userId);
            return res.json(orders);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const order = await orderService.getOrderById(id);
            return res.json(order);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const orders = await client_1.prisma.order.findMany({
                include: {
                    user: true,
                    items: { include: { product: true } },
                    address: true,
                },
                orderBy: { createdAt: "desc" },
            });
            return res.json(orders);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { status, cancelReason } = req.body;
            const updated = await client_1.prisma.order.update({
                where: { id },
                data: { status, cancelReason },
            });
            return res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderController = OrderController;
