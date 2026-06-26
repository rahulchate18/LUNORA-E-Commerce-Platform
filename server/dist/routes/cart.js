import { Router } from "express";
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart, } from "../controllers/cart-controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addToCartSchema, updateCartQuantitySchema, cartParamSchema, } from "../validators/shopping-validator.js";
const router = Router();
// Secure all routes in this sub-router
router.use(authenticate);
router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.patch("/:productId", validate(updateCartQuantitySchema), updateQuantity);
router.delete("/:productId", validate(cartParamSchema), removeFromCart);
router.delete("/", clearCart);
export default router;
//# sourceMappingURL=cart.js.map