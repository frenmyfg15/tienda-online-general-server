import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

interface UpdateUserInput {
  name?: string;
  // si luego quieres permitir cambiar email, lo añades aquí
}

export class UserService {
  @ServiceError()
  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error: any = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return user;
  }

  @ServiceError()
  async updateUser(id: number, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
