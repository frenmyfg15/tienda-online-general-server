// ✅ BACKEND
// ========================
// 1) AddressService: límite 7 direcciones por usuario
// src/services/address.service.ts

import { prisma } from "../prisma/client";
import { ServiceError } from "../utils/errorHandler";

interface AddressInput {
  fullName: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export class AddressService {
  @ServiceError()
  async getUserAddresses(userId: number) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  @ServiceError()
  async createAddress(userId: number, data: AddressInput) {
    const count = await prisma.address.count({
      where: { userId },
    });

    if (count >= 7) {
      const err: any = new Error("Has alcanzado el máximo de 7 direcciones");
      err.status = 400;
      throw err;
    }

    return prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
      },
    });
  }

  @ServiceError()
  async updateAddress(
    userId: number,
    addressId: number,
    data: Partial<AddressInput>
  ) {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      const err: any = new Error("Dirección no encontrada");
      err.status = 404;
      throw err;
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  @ServiceError()
  async deleteAddress(userId: number, addressId: number) {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      const err: any = new Error("Dirección no encontrada");
      err.status = 404;
      throw err;
    }

    return prisma.address.delete({
      where: { id: addressId },
    });
  }
}
