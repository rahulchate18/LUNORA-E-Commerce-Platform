import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamSchema,
} from "../validators/product-validator.js";

const router = Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// Admin-only protected routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCategorySchema),
  createCategory
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(categoryParamSchema),
  deleteCategory
);

export default router;
