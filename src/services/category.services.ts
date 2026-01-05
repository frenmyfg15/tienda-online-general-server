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

  /**
   * Elimina la categoría solo si no tiene productos asociados.
   */
  @ServiceError()
  async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      const error: any = new Error("Category not found");
      error.status = 404;
      throw error;
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      const error: any = new Error(
        "No se puede eliminar la categoría porque tiene productos asociados"
      );
      error.status = 400; // o 409 (Conflict) si prefieres
      throw error;
    }

    return prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Desactiva la categoría (isActive = false) para usarla como alternativa a la eliminación.
   */
  @ServiceError()
  async deactivateCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      const error: any = new Error("Category not found");
      error.status = 404;
      throw error;
    }

    if (!category.isActive) {
      // Ya está desactivada, simplemente la devolvemos
      return category;
    }

    return prisma.category.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
