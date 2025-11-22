// src/services/product.services.ts

import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";
import cloudinary from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { Express } from "express";

interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;

  stock: number;
  stockLocation?: string;
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

const uploadBufferToCloudinary = (
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (err, result) => {
        if (err || !result) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const makeUniqueSlug = async (
  baseSlug: string,
  ignoreId?: number
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (ignoreId && existing.id === ignoreId)) break;

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

const parseBool = (v: any): boolean | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "on";
};

const parseNumber = (v: any): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const parseDate = (v: any): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const parseTags = (v: any): string[] | undefined => {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.map(String).filter(Boolean);

  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t)).filter(Boolean);
      }
    } catch {
      return v
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return undefined;
};

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
  async createProduct(
    rawData: any,
    files: Express.Multer.File[] = []
  ) {
    if (!rawData) {
      const e: any = new Error("Invalid product data");
      e.status = 400;
      throw e;
    }

    const data: CreateProductInput = {
      name: String(rawData.name),
      slug: rawData.slug ? String(rawData.slug) : undefined,
      description: rawData.description
        ? String(rawData.description)
        : undefined,
      price: Number(rawData.price),
      compareAtPrice: parseNumber(rawData.compareAtPrice),
      costPrice: parseNumber(rawData.costPrice),
      stock: Number(rawData.stock),
      stockLocation: rawData.stockLocation
        ? String(rawData.stockLocation)
        : undefined,
      categoryId: Number(rawData.categoryId),
      condition: (rawData.condition as "NEW" | "USED") || "NEW",
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

    const product = await prisma.product.create({
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
      const uploaded = await Promise.all(
        files.map((file) => uploadBufferToCloudinary(file.buffer))
      );

      await prisma.productImage.createMany({
        data: uploaded.map((img, index) => ({
          productId: product.id,
          url: img.secure_url,
          sortOrder: index,
        })),
      });

      if (!product.image && uploaded[0]?.secure_url) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: uploaded[0].secure_url },
        });
      }
    }

    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: true,
      },
    });
  }

  @ServiceError()
  async updateProduct(
    id: number,
    rawData: any,
    files: Express.Multer.File[] = []
  ) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      const e: any = new Error("Product not found");
      e.status = 404;
      throw e;
    }

    if (!rawData) {
      const e: any = new Error("Invalid product data");
      e.status = 400;
      throw e;
    }

    const data = {
      name: String(rawData.name ?? existing.name),
      slug: rawData.slug ? String(rawData.slug) : existing.slug ?? undefined,
      description: rawData.description
        ? String(rawData.description)
        : existing.description ?? undefined,
      price:
        rawData.price !== undefined ? Number(rawData.price) : existing.price,
      compareAtPrice:
        rawData.compareAtPrice !== undefined
          ? parseNumber(rawData.compareAtPrice)
          : existing.compareAtPrice ?? undefined,
      costPrice:
        rawData.costPrice !== undefined
          ? parseNumber(rawData.costPrice)
          : existing.costPrice ?? undefined,
      stock:
        rawData.stock !== undefined ? Number(rawData.stock) : existing.stock,
      stockLocation:
        rawData.stockLocation !== undefined
          ? String(rawData.stockLocation)
          : existing.stockLocation ?? undefined,
      categoryId:
        rawData.categoryId !== undefined
          ? Number(rawData.categoryId)
          : existing.categoryId,
      condition: (rawData.condition as "NEW" | "USED") || existing.condition,
      brand:
        rawData.brand !== undefined
          ? String(rawData.brand)
          : existing.brand ?? undefined,
      sku:
        rawData.sku !== undefined
          ? String(rawData.sku)
          : existing.sku ?? undefined,
      barcode:
        rawData.barcode !== undefined
          ? String(rawData.barcode)
          : existing.barcode ?? undefined,
      tags:
        rawData.tags !== undefined
          ? parseTags(rawData.tags)
          : (existing.tags as string[] | null) ?? undefined,
      weightKg:
        rawData.weightKg !== undefined
          ? parseNumber(rawData.weightKg)
          : existing.weightKg ?? undefined,
      lengthCm:
        rawData.lengthCm !== undefined
          ? parseNumber(rawData.lengthCm)
          : existing.lengthCm ?? undefined,
      widthCm:
        rawData.widthCm !== undefined
          ? parseNumber(rawData.widthCm)
          : existing.widthCm ?? undefined,
      heightCm:
        rawData.heightCm !== undefined
          ? parseNumber(rawData.heightCm)
          : existing.heightCm ?? undefined,
      warrantyMonths:
        rawData.warrantyMonths !== undefined
          ? parseNumber(rawData.warrantyMonths)
          : existing.warrantyMonths ?? undefined,
      returnDays:
        rawData.returnDays !== undefined
          ? parseNumber(rawData.returnDays)
          : existing.returnDays ?? undefined,
      shippingEstimateDays:
        rawData.shippingEstimateDays !== undefined
          ? parseNumber(rawData.shippingEstimateDays)
          : existing.shippingEstimateDays ?? undefined,
      isFeatured:
        parseBool(rawData.isFeatured) ?? existing.isFeatured ?? false,
      publishedAt:
        rawData.publishedAt !== undefined
          ? parseDate(rawData.publishedAt)
          : existing.publishedAt ?? undefined,
      seoTitle:
        rawData.seoTitle !== undefined
          ? String(rawData.seoTitle)
          : existing.seoTitle ?? undefined,
      seoDescription:
        rawData.seoDescription !== undefined
          ? String(rawData.seoDescription)
          : existing.seoDescription ?? undefined,
    };

    const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.name);
    const slug = await makeUniqueSlug(baseSlug, id);

    const parseImagesToDelete = (v: any): number[] => {
      if (!v) return [];
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
        } catch {
          const n = Number(v);
          if (!Number.isNaN(n) && n > 0) return [n];
        }
      }
      return [];
    };

    const imagesToDelete = parseImagesToDelete(rawData.imagesToDelete);

    if (imagesToDelete.length > 0) {
      await prisma.productImage.deleteMany({
        where: {
          id: { in: imagesToDelete },
          productId: id,
        },
      });
    }

    const product = await prisma.product.update({
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
      const existingImages = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: "asc" },
        select: { sortOrder: true },
      });

      const baseOrder = existingImages.length;

      const uploaded = await Promise.all(
        files.map((file) => uploadBufferToCloudinary(file.buffer))
      );

      await prisma.productImage.createMany({
        data: uploaded.map((img, index) => ({
          productId: product.id,
          url: img.secure_url,
          sortOrder: baseOrder + index,
        })),
      });

      if (!product.image && uploaded[0]?.secure_url) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: uploaded[0].secure_url },
        });
      }
    }

    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
        variants: true,
        attributes: true,
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
