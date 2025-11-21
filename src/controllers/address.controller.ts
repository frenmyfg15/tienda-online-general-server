// 2) AddressController usando AddressService
// src/controllers/address.controller.ts

import { Request, Response, NextFunction } from "express";
import { AddressService } from "../services/address.services";

const addressService = new AddressService();

export class AddressController {
  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const addresses = await addressService.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const address = await addressService.createAddress(userId, req.body);
      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = Number(req.params.id);
      const address = await addressService.updateAddress(userId, id, req.body);
      res.json(address);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = Number(req.params.id);
      await addressService.deleteAddress(userId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
