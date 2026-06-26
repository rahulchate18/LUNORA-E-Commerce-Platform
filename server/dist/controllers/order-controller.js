import { OrderService } from "../services/order-service.js";
import { catchAsync } from "../utils/catch-async.js";
import { AppError } from "../utils/app-error.js";
// Helper to check user context
function getUserDetails(req) {
    if (!req.user || !req.user.id) {
        throw new AppError("Authentication credentials not found.", 401);
    }
    return { id: req.user.id, role: req.user.role };
}
// ─── Create Order ────────────────────────────────────────────────────────────
export const createOrder = catchAsync(async (req, res, _next) => {
    const user = getUserDetails(req);
    const order = await OrderService.createOrder(user.id, req.body);
    res.status(201).json({
        success: true,
        message: "Order placed successfully.",
        data: { order },
    });
});
// ─── Get User Orders ─────────────────────────────────────────────────────────
export const getUserOrders = catchAsync(async (req, res, _next) => {
    const user = getUserDetails(req);
    const orders = await OrderService.getUserOrders(user.id);
    res.status(200).json({
        success: true,
        count: orders.length,
        data: { orders },
    });
});
// ─── Get Order Details ───────────────────────────────────────────────────────
export const getOrderDetails = catchAsync(async (req, res, _next) => {
    const user = getUserDetails(req);
    const id = req.params.id;
    const order = await OrderService.getOrderDetails(user.id, user.role, id);
    res.status(200).json({
        success: true,
        data: { order },
    });
});
// ─── Cancel Order ────────────────────────────────────────────────────────────
export const cancelOrder = catchAsync(async (req, res, _next) => {
    const user = getUserDetails(req);
    const id = req.params.id;
    const order = await OrderService.cancelOrder(user.id, user.role, id);
    res.status(200).json({
        success: true,
        message: "Order cancelled successfully.",
        data: { order },
    });
});
// ─── Admin Update Order Status ────────────────────────────────────────────────
export const adminUpdateOrderStatus = catchAsync(async (req, res, _next) => {
    const id = req.params.id;
    const { orderStatus } = req.body;
    const order = await OrderService.adminUpdateOrderStatus(id, orderStatus);
    res.status(200).json({
        success: true,
        message: `Order status updated to "${orderStatus}" successfully.`,
        data: { order },
    });
});
//# sourceMappingURL=order-controller.js.map