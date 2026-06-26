import { Router } from "express";
import { createOrder, getUserOrders, getOrderDetails, cancelOrder, adminUpdateOrderStatus, } from "../controllers/order-controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema, updateOrderStatusSchema, orderParamSchema, } from "../validators/shopping-validator.js";
const router = Router();
// Secure all routes in this sub-router
router.use(authenticate);
// User-facing endpoints
router.post("/", validate(createOrderSchema), createOrder);
router.get("/", getUserOrders);
router.get("/:id", validate(orderParamSchema), getOrderDetails);
router.patch("/:id/cancel", validate(orderParamSchema), cancelOrder);
// Admin-only endpoints
router.patch("/:id/status", authorize("admin"), validate(updateOrderStatusSchema), adminUpdateOrderStatus);
export default router;
//# sourceMappingURL=orders.js.map