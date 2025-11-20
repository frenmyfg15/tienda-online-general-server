import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

export class CategoryService {
  @ServiceError()
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  @ServiceError()
  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      const error: any = new Error("Category not found");
      error.status = 404;
      throw error;
    }

    return category;
  }
}
