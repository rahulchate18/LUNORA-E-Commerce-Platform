import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { upload } from "../middlewares/upload.js";
import { uploadProductImages, deleteProductImage, reorderProductImages, setPrimaryProductImage, uploadImagesGeneric, } from "../controllers/upload-controller.js";
import { uploadParamSchema, deleteImageParamSchema, reorderImagesSchema, setPrimaryImageSchema, } from "../validators/upload-validator.js";
const router = Router();
// Protect all routes: Admin only
router.use(authenticate, authorize("admin"));
// POST /api/v1/uploads/images - Generic image uploads (upload-first-then-save workflow)
router.post("/images", upload.array("images", 10), uploadImagesGeneric);
// POST /api/v1/uploads/products/:id - Upload up to 10 images to a product
router.post("/products/:id", validate(uploadParamSchema), upload.array("images", 10), uploadProductImages);
// DELETE /api/v1/uploads/products/:id/images/:publicId - Delete image from Cloudinary & product
router.delete("/products/:id/images/:publicId", validate(deleteImageParamSchema), deleteProductImage);
// PATCH /api/v1/uploads/products/:id/reorder - Reorder gallery
router.patch("/products/:id/reorder", validate(reorderImagesSchema), reorderProductImages);
// PATCH /api/v1/uploads/products/:id/primary - Change primary image selection
router.patch("/products/:id/primary", validate(setPrimaryImageSchema), setPrimaryProductImage);
export default router;
//# sourceMappingURL=uploads.js.map