import { prisma } from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/hash";
import { createToken } from "../utils/token";
import { ServiceError } from "../utils/errorHandler";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  @ServiceError()
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error("Email already in use");
      error.status = 400;
      throw error;
    }

    const hashed = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        // role se queda por defecto en USER desde Prisma
      },
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  @ServiceError()
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const error: any = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const isValid = await comparePassword(data.password, user.password);

    if (!isValid) {
      const error: any = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}
