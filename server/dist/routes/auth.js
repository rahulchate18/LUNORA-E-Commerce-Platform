import { Router } from "express";
import { register, login, logout, getMe, forgotPassword, resetPassword, changePassword, } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rate-limiter.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, } from "../validators/auth-validator.js";
/**
 * server/src/routes/auth.ts — Authentication paths router
 */
const router = Router();
// Apply auth rate limiting to all auth endpoints generally
router.use(authLimiter);
// 1. Session Lifecycle Endpoints
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
// 2. Profile Details Endpoint
router.get("/me", authenticate, getMe);
// 3. Password recovery / change endpoints
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);
export default router;
//# sourceMappingURL=auth.js.map