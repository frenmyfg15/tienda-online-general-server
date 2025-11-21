"use strict";
// src/services/product.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const toSlug = (str) => str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
class ProductService {
    async getAllProducts() {
        return client_1.prisma.product.findMany({
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getProductById(id) {
        const p = await client_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
        });
        if (!p) {
            const e = new Error("Product not found");
            e.status = 404;
            throw e;
        }
        return p;
    }
    async searchProducts(q) {
        if (!q)
            return [];
        return client_1.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { brand: { contains: q } },
                    { sku: { contains: q } },
                    { barcode: { contains: q } },
                ],
            },
            include: { category: true },
        });
    }
    async getRandomProducts(limit = 20) {
        const all = await client_1.prisma.product.findMany({
            include: { category: true },
        });
        if (all.length <= limit)
            return all;
        return [...all].sort(() => Math.random() - 0.5).slice(0, limit);
    }
    async createProduct(data) {
        const slug = data.slug ? toSlug(data.slug) : toSlug(data.name);
        return client_1.prisma.product.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                costPrice: data.costPrice,
                stock: data.stock,
                stockLocation: data.stockLocation,
                image: data.image,
                categoryId: data.categoryId,
                condition: data.condition,
                brand: data.brand,
                sku: data.sku,
                barcode: data.barcode,
                tags: data.tags ?? undefined, // Json en Prisma
                weightKg: data.weightKg,
                lengthCm: data.lengthCm,
                widthCm: data.widthCm,
                heightCm: data.heightCm,
                warrantyMonths: data.warrantyMonths,
                returnDays: data.returnDays,
                shippingEstimateDays: data.shippingEstimateDays,
                isFeatured: data.isFeatured ?? false,
                publishedAt: data.publishedAt,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
            },
        });
    }
    async setProductStatus(id, isActive) {
        const exists = await client_1.prisma.product.findUnique({ where: { id } });
        if (!exists) {
            const e = new Error("Product not found");
            e.status = 404;
            throw e;
        }
        return client_1.prisma.product.update({
            where: { id },
            data: { isActive },
        });
    }
}
exports.ProductService = ProductService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "getAllProducts", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "getProductById", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "searchProducts", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "getRandomProducts", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "createProduct", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "setProductStatus", null);
