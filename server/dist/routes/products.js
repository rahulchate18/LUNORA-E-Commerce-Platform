import { Router } from "express";
import { createProduct, getAllProducts, getProductBySlug, getProductById, updateProduct, deleteProduct, getFeaturedProducts, getNewArrivals, getBestsellers, getRelatedProducts, } from "../controllers/product-controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema, productParamSchema, productQuerySchema, } from "../validators/product-validator.js";
const router = Router();
// Public custom collections
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/bestsellers", getBestsellers);
// General list/query route
router.get("/", validate(productQuerySchema), getAllProducts);
// Specific lookups
router.get("/:slug", getProductBySlug);
router.get("/id/:id", validate(productParamSchema), getProductById);
router.get("/:id/related", validate(productParamSchema), getRelatedProducts);
// Admin-only operations
router.post("/", authenticate, authorize("admin"), validate(createProductSchema), createProduct);
router.patch("/:id", authenticate, authorize("admin"), validate(updateProductSchema), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), validate(productParamSchema), deleteProduct);
export default router;
//# sourceMappingURL=products.js.map