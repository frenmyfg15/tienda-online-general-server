"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_services_1 = require("../services/cart.services");
const cartService = new cart_services_1.CartService();
class CartController {
    static async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCart(userId);
            return res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            const cart = await cartService.addToCart(userId, productId, quantity);
            return res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            const cart = await cartService.updateCartItem(userId, productId, quantity);
            return res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
    static async removeItem(req, res, next) {
        try {
            const userId = req.user.id;
            const productId = Number(req.params.productId);
            const cart = await cartService.removeFromCart(userId, productId);
            return res.json(cart);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CartController = CartController;
