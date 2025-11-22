// src/middleware/uploadImages.ts
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
}).array("images", 10); // campo "images", máximo 10 archivos
