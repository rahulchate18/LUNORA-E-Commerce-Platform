import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { Coupon } from "../models/coupon.js";
import { CartService } from "./cart-service.js";
import { AppError } from "../utils/app-error.js";
import { EmailService } from "./email-service.js";
import { logger } from "../config/logger.js";

export interface CreateOrderInput {
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: string;
  couponCode?: string;
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Refunded";
  paymentId?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
  paidAt?: Date;
}

export class OrderService {
  /**
   * Places a new order, validating inventory stock and applying coupon discounts.
   * Runs atomically inside a Mongoose transaction session.
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      attempts++;
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 1. Fetch user's cart
        const cart = await Cart.findOne({ user: userId }).session(session);
        if (!cart || cart.items.length === 0) {
          throw new AppError("Your shopping cart is empty.", 400);
        }

        // 2. Validate product stock levels and build order items snapshot
        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );

          if (!product) {
            const exists = await Product.findById(item.product).session(session);
            if (!exists) {
              throw new AppError(`Product with ID ${item.product} no longer exists.`, 404);
            }
            throw new AppError(
              `Insufficient stock for "${exists.name}". Available: ${exists.stock}, Requested: ${item.quantity}.`,
              400
            );
          }

          // Add to subtotal calculation
          subtotal += product.price * item.quantity;

          // Build item snapshot for the order
          orderItems.push({
            product: product._id as mongoose.Types.ObjectId,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor
              ? { name: item.selectedColor.name, hex: item.selectedColor.hex }
              : undefined,
            sku: product.sku,
          });
        }

        // 3. Process Coupon Discount
        let discount = 0;
        if (input.couponCode) {
          const coupon = await Coupon.findOne({
            code: input.couponCode.toUpperCase(),
          }).session(session);

          if (!coupon) {
            throw new AppError("Invalid coupon code.", 400);
          }

          if (!coupon.isValid(subtotal)) {
            throw new AppError(
              `Coupon code is inactive, expired, or minimum spend requirements are not met (Min spend: ₹${coupon.minSpend}).`,
              400
            );
          }

          if (coupon.discountType === "flat") {
            discount = coupon.discountValue;
          } else if (coupon.discountType === "percent") {
            discount = Math.round(subtotal * (coupon.discountValue / 100));
          }

          // Cap discount at subtotal amount
          discount = Math.min(discount, subtotal);
        }

        // 4. Calculate Tax, Shipping and Total
        const taxableAmount = subtotal - discount;
        const shipping = taxableAmount >= 2000 ? 0 : 99; // Free shipping for orders >= ₹2000
        const tax = Math.round(taxableAmount * 0.18); // 18% GST standard rate
        const total = taxableAmount + shipping + tax;

        // 5. Create Order Document record
        const order = new Order({
          user: new mongoose.Types.ObjectId(userId),
          items: orderItems,
          subtotal,
          shipping,
          discount,
          tax,
          total,
          paymentStatus: input.paymentStatus || "Pending",
          orderStatus: "Pending",
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          paymentId: input.paymentId || "",
          paymentOrderId: input.paymentOrderId || "",
          paymentSignature: input.paymentSignature || "",
          paidAt: input.paidAt,
        });

        await order.save({ session });

        // 6. Clear shopping cart
        cart.items = [];
        await cart.save({ session });

        // Commit transaction success
        await session.commitTransaction();

        // Trigger emails in the background (non-blocking)
        this.sendNewOrderEmails(userId, order).catch((err) => {
          logger.error("Failed to send order confirmation emails in background:", err);
        });

        return order;
      } catch (error: any) {
        await session.abortTransaction();

        const isTransient = error.errorLabels?.includes("TransientTransactionError") || error.code === 112;
        if (isTransient && attempts < maxRetries) {
          session.endSession();
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
          continue;
        }

        throw error;
      } finally {
        session.endSession();
      }
    }

    throw new AppError("System busy. Please try completing your checkout request again.", 409);
  }

  /**
   * Retrieves all orders for the current user.
   */
  static async getUserOrders(userId: string) {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Retrieves single order details, verifying ownership or admin status.
   */
  static async getOrderDetails(userId: string, userRole: string, orderId: string) {
    const order = await Order.findById(orderId).populate("user", "name email").lean();
    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    // Verify ownership
    if (userRole !== "admin" && order.user._id.toString() !== userId) {
      throw new AppError("Access denied. You do not own this order.", 403);
    }

    return order;
  }

  /**
   * Cancels a pending order, returning reserved inventory stock back.
   */
  static async cancelOrder(userId: string, userRole: string, orderId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new AppError("Order not found.", 404);
      }

      // Check ownership/permissions
      if (userRole !== "admin" && order.user.toString() !== userId) {
        throw new AppError("Access denied. You cannot cancel this order.", 403);
      }

      // Check cancellable state status
      if (!["Pending", "Processing"].includes(order.orderStatus)) {
        throw new AppError(
          `Cannot cancel order. It is already in "${order.orderStatus}" status.`,
          400
        );
      }

      // Restore product stock counts
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
        }
      }

      order.orderStatus = "Cancelled";
      await order.save({ session });

      await session.commitTransaction();

      // Trigger cancel order email in the background (non-blocking)
      this.sendCancelledOrderEmail(order).catch((err) => {
        logger.error("Failed to send order cancellation email in background:", err);
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Admin-only status updates.
   */
  static async adminUpdateOrderStatus(orderId: string, newStatus: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new AppError("Order not found.", 404);
      }

      const oldStatus = order.orderStatus;
      if (oldStatus === newStatus) {
        await session.commitTransaction();
        return order;
      }

      // If transitioning to Cancelled, restore stock
      if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          if (product) {
            product.stock += item.quantity;
            await product.save({ session });
          }
        }
      }

      order.orderStatus = newStatus as any;
      await order.save({ session });

      await session.commitTransaction();

      // Trigger status update emails in the background (non-blocking)
      this.sendStatusUpdateEmail(order, oldStatus, newStatus).catch((err) => {
        logger.error("Failed to send status update email in background:", err);
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private static async sendNewOrderEmails(userId: string, order: any) {
    try {
      const user = await mongoose.model("User").findById(userId);
      if (user) {
        // Send user confirmation
        await EmailService.sendOrderConfirmation(user.email, user.name, order);
        // Send admin notification
        await EmailService.sendAdminNewOrder(order);
      }
    } catch (err) {
      logger.error("Background Order Confirmation email generation error:", err);
    }
  }

  private static async sendCancelledOrderEmail(order: any) {
    try {
      const user = await mongoose.model("User").findById(order.user);
      if (user) {
        await EmailService.sendOrderCancelled(user.email, user.name, order);
      }
    } catch (err) {
      logger.error("Background Order Cancellation email error:", err);
    }
  }

  private static async sendStatusUpdateEmail(order: any, oldStatus: string, newStatus: string) {
    try {
      const user = await mongoose.model("User").findById(order.user);
      if (!user) return;

      if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
        await EmailService.sendOrderCancelled(user.email, user.name, order);
      } else if (newStatus === "Shipped" && oldStatus !== "Shipped") {
        const trackingNumber = `LUN-${Date.now().toString().substring(5)}`;
        await EmailService.sendShippingUpdate(user.email, user.name, order, "LUNORA Express (Blue Dart)", trackingNumber);
      } else if (newStatus === "Delivered" && oldStatus !== "Delivered") {
        await EmailService.sendDeliveryConfirmation(user.email, user.name, order);
      }
    } catch (err) {
      logger.error("Background Order Status Update email error:", err);
    }
  }
}
