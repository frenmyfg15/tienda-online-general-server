"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_services_1 = require("../services/product.services");
const productService = new product_services_1.ProductService();
class ProductController {
    static async getAll(req, res, next) {
        try {
            const r = await productService.getAllProducts();
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async getRandom(req, res, next) {
        try {
            const r = await productService.getRandomProducts();
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const r = await productService.getProductById(id);
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async search(req, res, next) {
        try {
            const q = req.query.q || "";
            const r = await productService.searchProducts(q);
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async create(req, res, next) {
        try {
            const files = req.files ?? [];
            const data = req.body;
            const r = await productService.createProduct(data, files);
            res.status(201).json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const files = req.files ?? [];
            const data = req.body;
            const r = await productService.updateProduct(id, data, files);
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { isActive } = req.body;
            const r = await productService.setProductStatus(id, Boolean(isActive));
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = Number(req.params.id);
            const r = await productService.deleteProduct(id);
            res.json(r);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.ProductController = ProductController;
