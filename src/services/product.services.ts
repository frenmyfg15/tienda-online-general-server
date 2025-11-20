// src/services/product.service.ts

import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;

  stock: number;
  stockLocation?: string;
  image?: string;
  categoryId: number;
  condition: "NEW" | "USED";

  // catálogo
  brand?: string;
  sku?: string;
  barcode?: string;
  tags?: string[];

  // logística
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;

  // garantías / envíos
  warrantyMonths?: number;
  returnDays?: number;
  shippingEstimateDays?: number;

  // publishing / SEO
  isFeatured?: boolean;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
}

const toSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class ProductService {
  @ServiceError()
  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @ServiceError()
  async getProductById(id: number) {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: true,
      },
    });
    if (!p) {
      const e: any = new Error("Product not found");
      e.status = 404;
      throw e;
    }
    return p;
  }

  @ServiceError()
  async searchProducts(q: string) {
    if (!q) return [];

    return prisma.product.findMany({
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


  @ServiceError()
  async getRandomProducts(limit = 20) {
    const all = await prisma.product.findMany({
      include: { category: true },
    });
    if (all.length <= limit) return all;
    return [...all].sort(() => Math.random() - 0.5).slice(0, limit);
  }

  @ServiceError()
  async createProduct(data: CreateProductInput) {
    const slug = data.slug ? toSlug(data.slug) : toSlug(data.name);

    return prisma.product.create({
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

  @ServiceError()
  async setProductStatus(id: number, isActive: boolean) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      const e: any = new Error("Product not found");
      e.status = 404;
      throw e;
    }

    return prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }
}
