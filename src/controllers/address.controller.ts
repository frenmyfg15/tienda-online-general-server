import { Request, Response, NextFunction } from "express";
import { AddressService } from "../services/address.services";

const addressService = new AddressService();

export class AddressController {
  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await addressService.getAddresses(userId);

      return res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = req.body;

      const address = await addressService.createAddress(userId, data);

      return res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const updated = await addressService.updateAddress(id, data);

      return res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      const removed = await addressService.deleteAddress(id);

      return res.json(removed);
    } catch (error) {
      next(error);
    }
  }
}
