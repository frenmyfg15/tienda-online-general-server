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
  async getAddresses(userId: number) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  @ServiceError()
  async createAddress(userId: number, data: AddressInput) {
    return prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  @ServiceError()
  async updateAddress(id: number, data: Partial<AddressInput>) {
    const address = await prisma.address.update({
      where: { id },
      data,
    });

    return address;
  }

  @ServiceError()
  async deleteAddress(id: number) {
    const address = await prisma.address.delete({
      where: { id },
    });

    return address;
  }
}
