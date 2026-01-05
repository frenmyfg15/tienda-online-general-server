"use strict";
// ✅ BACKEND
// ========================
// 1) AddressService: límite 7 direcciones por usuario
// src/services/address.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
class AddressService {
    async getUserAddresses(userId) {
        return client_1.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async createAddress(userId, data) {
        const count = await client_1.prisma.address.count({
            where: { userId },
        });
        if (count >= 7) {
            const err = new Error("Has alcanzado el máximo de 7 direcciones");
            err.status = 400;
            throw err;
        }
        return client_1.prisma.address.create({
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
    async updateAddress(userId, addressId, data) {
        const existing = await client_1.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!existing || existing.userId !== userId) {
            const err = new Error("Dirección no encontrada");
            err.status = 404;
            throw err;
        }
        return client_1.prisma.address.update({
            where: { id: addressId },
            data,
        });
    }
    async deleteAddress(userId, addressId) {
        const existing = await client_1.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!existing || existing.userId !== userId) {
            const err = new Error("Dirección no encontrada");
            err.status = 404;
            throw err;
        }
        return client_1.prisma.address.delete({
            where: { id: addressId },
        });
    }
}
exports.AddressService = AddressService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "getUserAddresses", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "createAddress", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "updateAddress", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "deleteAddress", null);
