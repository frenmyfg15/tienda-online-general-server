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
            const addressId = req.body.addressId;
            console.log("🟦 [OrderController] createOrder() called");
            console.log("   → userId:", userId);
            console.log("   → addressId:", addressId);
            const order = await orderService.createOrder(userId, addressId);
            console.log("✅ [OrderController] Order created successfully:", order?.id);
            return res.status(201).json(order);
        }
        catch (error) {
            console.error("❌ [OrderController] Error in createOrder:", error);
            next(error);
        }
    }
    static async getUserOrders(req, res, next) {
        try {
            const userId = req.user.id;
            console.log("🟦 [OrderController] getUserOrders() userId:", userId);
            const orders = await client_1.prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                include: {
                    items: { include: { product: true } },
                    address: true,
                },
            });
            return res.json(orders);
        }
        catch (error) {
            console.error("❌ [OrderController] Error in getUserOrders:", error);
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            console.log("🟦 [OrderController] getById() id:", id);
            const order = await orderService.getOrderById(id);
            return res.json(order);
        }
        catch (error) {
            console.error("❌ [OrderController] Error in getById:", error);
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            console.log("🟦 [OrderController] getAll()");
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
            console.error("❌ [OrderController] Error in getAll:", error);
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { status, cancelReason } = req.body;
            console.log("🟦 [OrderController] updateStatus()");
            console.log("   → id:", id);
            console.log("   → status:", status);
            console.log("   → cancelReason:", cancelReason);
            const updated = await client_1.prisma.order.update({
                where: { id },
                data: { status, cancelReason },
                include: {
                    user: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    address: true,
                },
            });
            return res.json(updated);
        }
        catch (error) {
            console.error("❌ [OrderController] Error in updateStatus:", error);
            next(error);
        }
    }
}
exports.OrderController = OrderController;
