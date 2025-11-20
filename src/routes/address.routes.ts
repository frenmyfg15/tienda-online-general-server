import { Router } from "express";
import { AddressController } from "../controllers/address.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authRequired, AddressController.getAddresses);
router.post("/", authRequired, AddressController.createAddress);
router.put("/:id", authRequired, AddressController.updateAddress);
router.delete("/:id", authRequired, AddressController.deleteAddress);

export default router;
