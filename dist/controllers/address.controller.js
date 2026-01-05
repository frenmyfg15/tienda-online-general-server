"use strict";
// 2) AddressController usando AddressService
// src/controllers/address.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const address_services_1 = require("../services/address.services");
const addressService = new address_services_1.AddressService();
class AddressController {
    static async getAddresses(req, res, next) {
        try {
            const userId = req.user.id;
            const addresses = await addressService.getUserAddresses(userId);
            res.json(addresses);
        }
        catch (error) {
            next(error);
        }
    }
    static async createAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const address = await addressService.createAddress(userId, req.body);
            res.status(201).json(address);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const id = Number(req.params.id);
            const address = await addressService.updateAddress(userId, id, req.body);
            res.json(address);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const id = Number(req.params.id);
            await addressService.deleteAddress(userId, id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AddressController = AddressController;
