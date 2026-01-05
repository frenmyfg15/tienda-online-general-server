"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
class CategoryService {
    async getAllCategories() {
        return client_1.prisma.category.findMany({
            orderBy: { name: "asc" },
        });
    }
    async getCategoryById(id) {
        const category = await client_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }
        return category;
    }
    /**
     * Elimina la categoría solo si no tiene productos asociados.
     */
    async deleteCategory(id) {
        const category = await client_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }
        const productCount = await client_1.prisma.product.count({
            where: { categoryId: id },
        });
        if (productCount > 0) {
            const error = new Error("No se puede eliminar la categoría porque tiene productos asociados");
            error.status = 400; // o 409 (Conflict) si prefieres
            throw error;
        }
        return client_1.prisma.category.delete({
            where: { id },
        });
    }
    /**
     * Desactiva la categoría (isActive = false) para usarla como alternativa a la eliminación.
     */
    async deactivateCategory(id) {
        const category = await client_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            const error = new Error("Category not found");
            error.status = 404;
            throw error;
        }
        if (!category.isActive) {
            // Ya está desactivada, simplemente la devolvemos
            return category;
        }
        return client_1.prisma.category.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }
}
exports.CategoryService = CategoryService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], CategoryService.prototype, "getAllCategories", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CategoryService.prototype, "getCategoryById", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CategoryService.prototype, "deleteCategory", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], CategoryService.prototype, "deactivateCategory", null);
