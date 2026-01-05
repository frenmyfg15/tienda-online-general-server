"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const client_1 = require("../prisma/client");
const category_services_1 = require("../services/category.services");
const categoryService = new category_services_1.CategoryService();
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
    /**
     * DELETE — elimina solo si no hay productos asociados
     */
    static async delete(req, res, next) {
        try {
            const id = Number(req.params.id);
            const deleted = await categoryService.deleteCategory(id);
            return res.json({
                success: true,
                message: "Categoría eliminada correctamente",
                category: deleted,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH — desactivar categoría (plan B si no se puede eliminar)
     */
    static async deactivate(req, res, next) {
        try {
            const id = Number(req.params.id);
            const updated = await categoryService.deactivateCategory(id);
            return res.json({
                success: true,
                message: "Categoría desactivada",
                category: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
