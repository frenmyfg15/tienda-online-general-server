"use strict";
// src/controllers/cart.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = require("../services/cart.service");
const cartService = new cart_service_1.CartService();
class CartController {
    static async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            await cartService.addToCart(userId, Number(productId), Number(quantity || 1));
            const cart = await cartService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            await cartService.updateItem(userId, Number(productId), Number(quantity));
            const cart = await cartService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async removeItem(req, res, next) {
        try {
            const userId = req.user.id;
            const productId = Number(req.params.productId);
            await cartService.removeItem(userId, productId);
            const cart = await cartService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async clearCart(req, res, next) {
        try {
            const userId = req.user.id;
            await cartService.clearCart(userId);
            const cart = await cartService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CartController = CartController;
