import { Router } from "express";
import { createPaymentOrder, verifyPaymentSignature, getPaymentHistory, } from "../controllers/payment-controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createPaymentOrderSchema, verifyPaymentSchema, } from "../validators/payment-validator.js";
const router = Router();
// Protect all payment endpoints generally
router.use(authenticate);
router.post("/create-order", validate(createPaymentOrderSchema), createPaymentOrder);
router.post("/verify", validate(verifyPaymentSchema), verifyPaymentSignature);
router.get("/history", getPaymentHistory);
export default router;
//# sourceMappingURL=payments.js.map