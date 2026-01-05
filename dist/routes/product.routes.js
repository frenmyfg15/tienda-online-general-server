"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/product.routes.ts
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const uploadImages_1 = require("../middleware/uploadImages");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.ProductController.getAll);
router.get("/random", product_controller_1.ProductController.getRandom);
router.get("/search", product_controller_1.ProductController.search);
router.get("/:id", product_controller_1.ProductController.getById);
router.post("/", uploadImages_1.uploadImages, product_controller_1.ProductController.create);
exports.default = router;
