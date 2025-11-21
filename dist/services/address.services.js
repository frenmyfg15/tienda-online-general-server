"use strict";
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
    async getAddresses(userId) {
        return client_1.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async createAddress(userId, data) {
        return client_1.prisma.address.create({
            data: {
                userId,
                ...data,
            },
        });
    }
    async updateAddress(id, data) {
        const address = await client_1.prisma.address.update({
            where: { id },
            data,
        });
        return address;
    }
    async deleteAddress(id) {
        const address = await client_1.prisma.address.delete({
            where: { id },
        });
        return address;
    }
}
exports.AddressService = AddressService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "getAddresses", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "createAddress", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "updateAddress", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], AddressService.prototype, "deleteAddress", null);
