"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const client_1 = require("../prisma/client");
class CategoryController {
    static async getAll(req, res, next) {
        try {
            const categories = await client_1.prisma.category.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.json(categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const category = await client_1.prisma.category.findUnique({
                where: { id },
                include: { products: true },
            });
            if (!category) {
                const err = new Error("Category not found");
                err.status = 404;
                throw err;
            }
            return res.json(category);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, slug } = req.body;
            const category = await client_1.prisma.category.create({
                data: { name, slug },
            });
            return res.status(201).json(category);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
