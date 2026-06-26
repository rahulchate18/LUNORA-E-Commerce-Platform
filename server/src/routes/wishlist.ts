import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
} from "../controllers/wishlist-controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  addToWishlistSchema,
  wishlistParamSchema,
  moveWishlistItemToCartSchema,
} from "../validators/shopping-validator.js";

const router = Router();

// Secure all routes in this sub-router
router.use(authenticate);

router.get("/", getWishlist);
router.post("/", validate(addToWishlistSchema), addToWishlist);
router.delete("/:productId", validate(wishlistParamSchema), removeFromWishlist);
router.post(
  "/:productId/move-to-cart",
  validate(moveWishlistItemToCartSchema),
  moveWishlistItemToCart
);

export default router;
