"use strict";
// src/services/product.services.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const toSlug = (str) => str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "products" }, (err, result) => {
            if (err || !result)
                reject(err);
            else
                resolve(result);
        });
        stream.end(buffer);
    });
};
const extractCloudinaryPublicId = (url) => {
    try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        const [filename] = last.split(".");
        const folderIndex = parts.findIndex((p) => p === "products");
        if (folderIndex !== -1)
            return `products/${filename}`;
        return filename;
    }
    catch {
        return null;
    }
};
const makeUniqueSlug = async (baseSlug, ignoreId) => {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await client_1.prisma.product.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (!existing || (ignoreId && existing.id === ignoreId))
            break;
        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
    return slug;
};
const parseBool = (v) => {
    if (v === undefined || v === null || v === "")
        return undefined;
    if (typeof v === "boolean")
        return v;
    const s = String(v).toLowerCase();
    return s === "true" || s === "1" || s === "on";
};
const parseNumber = (v) => {
    if (v === undefined || v === null || v === "")
        return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
};
const parseDate = (v) => {
    if (!v)
        return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
};
const parseTags = (v) => {
    if (!v)
        return undefined;
    if (Array.isArray(v))
        return v.map(String).filter(Boolean);
    if (typeof v === "string") {
        try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) {
                return parsed.map((t) => String(t)).filter(Boolean);
            }
        }
        catch {
            return v
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        }
    }
    return undefined;
};
class ProductService {
    // ==============================
    // LISTADO (solo activos + cat activa)
    // ==============================
    async getAllProducts() {
        return client_1.prisma.product.findMany({
            where: {
                isActive: true,
                category: { isActive: true },
            },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    // ==============================
    // DETALLE POR ID (aplica misma regla)
    // ==============================
    async getProductById(id) {
        const p = await client_1.prisma.product.findFirst({
            where: {
                id,
                isActive: true,
                category: { isActive: true },
            },
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
    // ==============================
    // BUSCADOR
    // ==============================
    async searchProducts(q) {
        if (!q)
            return [];
        return client_1.prisma.product.findMany({
            where: {
                isActive: true,
                category: { isActive: true },
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
    // ==============================
    // RANDOM
    // ==============================
    async getRandomProducts(limit = 20) {
        const all = await client_1.prisma.product.findMany({
            where: {
                isActive: true,
                category: { isActive: true },
            },
            include: { category: true },
        });
        if (all.length <= limit)
            return all;
        return [...all].sort(() => Math.random() - 0.5).slice(0, limit);
    }
    // ==============================
    // CREAR
    // ==============================
    async createProduct(rawData, files = []) {
        if (!rawData) {
            const e = new Error("Invalid product data");
            e.status = 400;
            throw e;
        }
        const data = {
            name: String(rawData.name),
            slug: rawData.slug ? String(rawData.slug) : undefined,
            description: rawData.description ? String(rawData.description) : undefined,
            price: Number(rawData.price),
            compareAtPrice: parseNumber(rawData.compareAtPrice),
            costPrice: parseNumber(rawData.costPrice),
            stock: Number(rawData.stock),
            stockLocation: rawData.stockLocation
                ? String(rawData.stockLocation)
                : undefined,
            categoryId: Number(rawData.categoryId),
            condition: rawData.condition || "NEW",
            brand: rawData.brand ? String(rawData.brand) : undefined,
            sku: rawData.sku ? String(rawData.sku) : undefined,
            barcode: rawData.barcode ? String(rawData.barcode) : undefined,
            tags: parseTags(rawData.tags),
            weightKg: parseNumber(rawData.weightKg),
            lengthCm: parseNumber(rawData.lengthCm),
            widthCm: parseNumber(rawData.widthCm),
            heightCm: parseNumber(rawData.heightCm),
            warrantyMonths: parseNumber(rawData.warrantyMonths),
            returnDays: parseNumber(rawData.returnDays),
            shippingEstimateDays: parseNumber(rawData.shippingEstimateDays),
            isFeatured: parseBool(rawData.isFeatured) ?? false,
            publishedAt: parseDate(rawData.publishedAt),
            seoTitle: rawData.seoTitle ? String(rawData.seoTitle) : undefined,
            seoDescription: rawData.seoDescription
                ? String(rawData.seoDescription)
                : undefined,
        };
        const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.name);
        const slug = await makeUniqueSlug(baseSlug);
        const product = await client_1.prisma.product.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                costPrice: data.costPrice,
                stock: data.stock,
                stockLocation: data.stockLocation,
                categoryId: data.categoryId,
                condition: data.condition,
                brand: data.brand,
                sku: data.sku,
                barcode: data.barcode,
                tags: data.tags ?? undefined,
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
        if (files && files.length > 0) {
            const uploaded = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
            await client_1.prisma.productImage.createMany({
                data: uploaded.map((img, index) => ({
                    productId: product.id,
                    url: img.secure_url,
                    sortOrder: index,
                })),
            });
            if (!product.image && uploaded[0]?.secure_url) {
                await client_1.prisma.product.update({
                    where: { id: product.id },
                    data: { image: uploaded[0].secure_url },
                });
            }
        }
        return client_1.prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
        });
    }
    // ==============================
    // ACTUALIZAR
    // ==============================
    async updateProduct(id, rawData, files = []) {
        const existing = await client_1.prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!existing) {
            const e = new Error("Product not found");
            e.status = 404;
            throw e;
        }
        if (!rawData) {
            const e = new Error("Invalid product data");
            e.status = 400;
            throw e;
        }
        const data = {
            name: String(rawData.name ?? existing.name),
            slug: rawData.slug ? String(rawData.slug) : existing.slug ?? undefined,
            description: rawData.description
                ? String(rawData.description)
                : existing.description ?? undefined,
            price: rawData.price !== undefined ? Number(rawData.price) : existing.price,
            compareAtPrice: rawData.compareAtPrice !== undefined
                ? parseNumber(rawData.compareAtPrice)
                : existing.compareAtPrice ?? undefined,
            costPrice: rawData.costPrice !== undefined
                ? parseNumber(rawData.costPrice)
                : existing.costPrice ?? undefined,
            stock: rawData.stock !== undefined ? Number(rawData.stock) : existing.stock,
            stockLocation: rawData.stockLocation !== undefined
                ? String(rawData.stockLocation)
                : existing.stockLocation ?? undefined,
            categoryId: rawData.categoryId !== undefined
                ? Number(rawData.categoryId)
                : existing.categoryId,
            condition: rawData.condition || existing.condition,
            brand: rawData.brand !== undefined
                ? String(rawData.brand)
                : existing.brand ?? undefined,
            sku: rawData.sku !== undefined
                ? String(rawData.sku)
                : existing.sku ?? undefined,
            barcode: rawData.barcode !== undefined
                ? String(rawData.barcode)
                : existing.barcode ?? undefined,
            tags: rawData.tags !== undefined
                ? parseTags(rawData.tags)
                : existing.tags ?? undefined,
            weightKg: rawData.weightKg !== undefined
                ? parseNumber(rawData.weightKg)
                : existing.weightKg ?? undefined,
            lengthCm: rawData.lengthCm !== undefined
                ? parseNumber(rawData.lengthCm)
                : existing.lengthCm ?? undefined,
            widthCm: rawData.widthCm !== undefined
                ? parseNumber(rawData.widthCm)
                : existing.widthCm ?? undefined,
            heightCm: rawData.heightCm !== undefined
                ? parseNumber(rawData.heightCm)
                : existing.heightCm ?? undefined,
            warrantyMonths: rawData.warrantyMonths !== undefined
                ? parseNumber(rawData.warrantyMonths)
                : existing.warrantyMonths ?? undefined,
            returnDays: rawData.returnDays !== undefined
                ? parseNumber(rawData.returnDays)
                : existing.returnDays ?? undefined,
            shippingEstimateDays: rawData.shippingEstimateDays !== undefined
                ? parseNumber(rawData.shippingEstimateDays)
                : existing.shippingEstimateDays ?? undefined,
            isFeatured: parseBool(rawData.isFeatured) ?? existing.isFeatured ?? false,
            publishedAt: rawData.publishedAt !== undefined
                ? parseDate(rawData.publishedAt)
                : existing.publishedAt ?? undefined,
            seoTitle: rawData.seoTitle !== undefined
                ? String(rawData.seoTitle)
                : existing.seoTitle ?? undefined,
            seoDescription: rawData.seoDescription !== undefined
                ? String(rawData.seoDescription)
                : existing.seoDescription ?? undefined,
        };
        const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.name);
        const slug = await makeUniqueSlug(baseSlug, id);
        const parseImagesToDelete = (v) => {
            if (!v)
                return [];
            if (Array.isArray(v)) {
                return v
                    .map((x) => Number(x))
                    .filter((x) => !Number.isNaN(x) && x > 0);
            }
            if (typeof v === "string") {
                try {
                    const parsed = JSON.parse(v);
                    if (Array.isArray(parsed)) {
                        return parsed
                            .map((x) => Number(x))
                            .filter((x) => !Number.isNaN(x) && x > 0);
                    }
                }
                catch {
                    const n = Number(v);
                    if (!Number.isNaN(n) && n > 0)
                        return [n];
                }
            }
            return [];
        };
        const imagesToDelete = parseImagesToDelete(rawData.imagesToDelete);
        if (imagesToDelete.length > 0) {
            await client_1.prisma.productImage.deleteMany({
                where: {
                    id: { in: imagesToDelete },
                    productId: id,
                },
            });
        }
        const product = await client_1.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                slug,
                description: data.description,
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                costPrice: data.costPrice,
                stock: data.stock,
                stockLocation: data.stockLocation,
                categoryId: data.categoryId,
                condition: data.condition,
                brand: data.brand,
                sku: data.sku,
                barcode: data.barcode,
                tags: data.tags ?? undefined,
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
        if (files && files.length > 0) {
            const existingImages = await client_1.prisma.productImage.findMany({
                where: { productId: id },
                orderBy: { sortOrder: "asc" },
                select: { sortOrder: true },
            });
            const baseOrder = existingImages.length;
            const uploaded = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
            await client_1.prisma.productImage.createMany({
                data: uploaded.map((img, index) => ({
                    productId: product.id,
                    url: img.secure_url,
                    sortOrder: baseOrder + index,
                })),
            });
            if (!product.image && uploaded[0]?.secure_url) {
                await client_1.prisma.product.update({
                    where: { id: product.id },
                    data: { image: uploaded[0].secure_url },
                });
            }
        }
        return client_1.prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
        });
    }
    // ==============================
    // ACTIVAR / DESACTIVAR
    // ==============================
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
    // ==============================
    // ELIMINAR
    // ==============================
    async deleteProduct(id) {
        const product = await client_1.prisma.product.findUnique({
            where: { id },
            include: {
                orderItems: true,
                images: true,
            },
        });
        if (!product) {
            const e = new Error("Product not found");
            e.status = 404;
            throw e;
        }
        if (product.orderItems.length > 0) {
            const e = new Error("Cannot delete product with existing orders");
            e.status = 400;
            throw e;
        }
        if (product.images.length > 0) {
            await Promise.all(product.images.map(async (img) => {
                const publicId = extractCloudinaryPublicId(img.url);
                if (!publicId)
                    return;
                try {
                    await cloudinary_1.default.uploader.destroy(publicId);
                }
                catch (err) {
                    console.error("Error deleting Cloudinary image", publicId, err);
                }
            }));
        }
        await client_1.prisma.$transaction([
            client_1.prisma.productImage.deleteMany({ where: { productId: id } }),
            client_1.prisma.productVariant.deleteMany({ where: { productId: id } }),
            client_1.prisma.productAttributeValue.deleteMany({ where: { productId: id } }),
            client_1.prisma.cartItem.deleteMany({ where: { productId: id } }),
            client_1.prisma.product.delete({ where: { id } }),
        ]);
        return { success: true };
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
], ProductService.prototype, "updateProduct", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "setProductStatus", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], ProductService.prototype, "deleteProduct", null);
