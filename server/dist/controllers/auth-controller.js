import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/db.js";
import { User } from "../models/user.js";
import { AppError } from "../utils/app-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { logger } from "../config/logger.js";
import { catchAsync } from "../utils/catch-async.js";
import { EmailService } from "../services/email-service.js";
/**
 * Sign JWT Token
 */
const signToken = (id, role, email) => {
    return jwt.sign({ id, role, email }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};
/**
 * Send Token Cookie and API Response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = signToken(user._id.toString(), user.role, user.email);
    // Parse expiry duration from config or default to 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cookieOptions = {
        expires: expiresAt,
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
    };
    res.cookie("token", token, cookieOptions);
    // Generate and set CSRF token cookie readable by client JS
    const csrfToken = crypto.randomBytes(24).toString("hex");
    res.cookie("csrfToken", csrfToken, {
        expires: expiresAt,
        httpOnly: false,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
    });
    // Sanitize password out of response data
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    new ApiResponse(res, statusCode, { user: userObj, token, csrfToken }, message);
};
/**
 * Register a new user account
 */
export const register = catchAsync(async (req, res) => {
    const { name, email, password, phone } = req.body;
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("A user with this email address already exists.", 400);
    }
    // 2. Determine role: first user registered becomes admin, subsequent users become standard users
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin" : "user";
    // 3. Create the user
    const newUser = await User.create({
        name,
        email,
        password,
        role,
        phone,
    });
    logger.info(`Session Action: User registered successfully. Email: ${email}, Role: ${role}`);
    // Send welcome email in background
    EmailService.sendWelcome(newUser.email, newUser.name).catch((err) => {
        logger.error(`Email Service Error: Failed to send welcome email to ${newUser.email}:`, err);
    });
    sendTokenResponse(newUser, 201, res, "Account registered successfully.");
});
/**
 * User login
 */
export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    // 1. Fetch user including password field (since password select is false in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError("Invalid credentials. Incorrect email or password.", 401);
    }
    // 2. Validate password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new AppError("Invalid credentials. Incorrect email or password.", 401);
    }
    logger.info(`Session Action: User logged in. Email: ${email}`);
    sendTokenResponse(user, 200, res, "Login successful.");
});
/**
 * User logout
 */
export const logout = catchAsync(async (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.cookie("csrfToken", "", {
        expires: new Date(0),
        httpOnly: false,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
    });
    logger.info("Session Action: User logged out successfully.");
    new ApiResponse(res, 200, null, "Logged out successfully.");
});
/**
 * Get current user profile details
 */
export const getMe = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError("Access denied. Please authenticate.", 401);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new AppError("User profile not found.", 404);
    }
    // Ensure csrfToken cookie is present for cookie-authenticated sessions
    if (req.cookies && req.cookies.token && !req.cookies.csrfToken) {
        const csrfToken = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        res.cookie("csrfToken", csrfToken, {
            expires: expiresAt,
            httpOnly: false,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }
    new ApiResponse(res, 200, { user }, "User profile retrieved successfully.");
});
/**
 * Forgot password request token builder
 */
export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    // 1. Find user by email
    const user = await User.findOne({ email });
    // 2. Mitigation of email enumeration: return success even if user doesn't exist
    const genericSuccessMessage = "If an account with that email exists, a password reset link has been sent.";
    if (!user) {
        logger.warn(`Security Info: Password reset requested for non-existent email '${email}'`);
        new ApiResponse(res, 200, null, genericSuccessMessage);
        return;
    }
    // 3. Generate raw reset token (32 bytes)
    const rawToken = crypto.randomBytes(32).toString("hex");
    // 4. Hash token using SHA-256 and save to user document with 10 minutes expiry
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save({ validateBeforeSave: false });
    // 5. Construct reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${rawToken}`;
    logger.info(`Security Alert: Password reset token generated for ${email}. Reset URL:\n${resetUrl}`);
    // Send forgot password email in background
    EmailService.sendForgotPassword(user.email, user.name, rawToken).catch((err) => {
        logger.error(`Email Service Error: Failed to send forgot password email to ${user.email}:`, err);
    });
    // In development, send the link in payload for ease of local validation
    const responseData = env.NODE_ENV === "development" ? { resetUrl, token: rawToken } : null;
    new ApiResponse(res, 200, responseData, genericSuccessMessage);
});
/**
 * Reset password using verification token
 */
export const resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req.body;
    // 1. Re-hash token using SHA-256 to query database record
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // 2. Find user by token and verify expiration
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    }).select("+password"); // Select password so save pre-hooks calculate correctly
    if (!user) {
        throw new AppError("Invalid or expired password reset token.", 400);
    }
    // 3. Update password and clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    logger.info(`Security Success: Password reset successfully for ${user.email}`);
    // Send password reset success email in background
    EmailService.sendPasswordResetSuccess(user.email, user.name).catch((err) => {
        logger.error(`Email Service Error: Failed to send password reset success email to ${user.email}:`, err);
    });
    new ApiResponse(res, 200, null, "Password reset successful. Please log in with your new credentials.");
});
/**
 * Change current user password from profile settings
 */
export const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
        throw new AppError("Access denied. Please authenticate.", 401);
    }
    // 1. Fetch user with password field
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
        throw new AppError("User profile not found.", 404);
    }
    // 2. Validate current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError("Incorrect current password.", 401);
    }
    // 3. Set and save new password (auto-hashes via pre-save hook)
    user.password = newPassword;
    await user.save();
    logger.info(`Security Success: Password updated successfully for user profile ${user.email}`);
    new ApiResponse(res, 200, null, "Password updated successfully.");
});
//# sourceMappingURL=auth-controller.js.map