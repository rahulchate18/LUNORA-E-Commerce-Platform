import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoryRouter from "./categories.js";
import productRouter from "./products.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import ordersRouter from "./orders.js";
import paymentsRouter from "./payments.js";
import uploadsRouter from "./uploads.js";
import contactRouter from "./contact.js";
import adminEmailsRouter from "./admin-emails.js";
/**
 * server/src/routes/index.ts — Main API Root Router
 */
const apiRouter = Router();
// Mount sub-routers
apiRouter.use("/", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/admin/emails", adminEmailsRouter);
export default apiRouter;
//# sourceMappingURL=index.js.map