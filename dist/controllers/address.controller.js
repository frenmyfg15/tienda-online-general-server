"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const address_services_1 = require("../services/address.services");
const addressService = new address_services_1.AddressService();
class AddressController {
    static async getAddresses(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await addressService.getAddresses(userId);
            return res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
    static async createAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const data = req.body;
            const address = await addressService.createAddress(userId, data);
            return res.status(201).json(address);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAddress(req, res, next) {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updated = await addressService.updateAddress(id, data);
            return res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAddress(req, res, next) {
        try {
            const id = Number(req.params.id);
            const removed = await addressService.deleteAddress(id);
            return res.json(removed);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AddressController = AddressController;
