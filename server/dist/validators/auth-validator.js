import * as z from "zod";
/**
 * server/src/validators/auth-validator.ts — Authentication request Zod validation schemas
 */
// Safe password complexity regex: min 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number
const passwordComplexity = z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one numeric digit.");
export const registerSchema = {
    body: z.object({
        name: z
            .string({ required_error: "Full name is required." })
            .min(2, "Name must be at least 2 characters.")
            .max(50, "Name cannot exceed 50 characters.")
            .trim(),
        email: z
            .string({ required_error: "Email is required." })
            .email("Please provide a valid email address.")
            .trim()
            .toLowerCase(),
        password: passwordComplexity,
        phone: z.string().optional(),
    }),
};
export const loginSchema = {
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .email("Please provide a valid email address.")
            .trim()
            .toLowerCase(),
        password: z.string({ required_error: "Password is required." }),
    }),
};
export const forgotPasswordSchema = {
    body: z.object({
        email: z
            .string({ required_error: "Email is required." })
            .email("Please provide a valid email address.")
            .trim()
            .toLowerCase(),
    }),
};
export const resetPasswordSchema = {
    body: z.object({
        token: z.string({ required_error: "Reset token is required." }).min(1, "Reset token cannot be empty."),
        password: passwordComplexity,
    }),
};
export const changePasswordSchema = {
    body: z.object({
        currentPassword: z.string({ required_error: "Current password is required." }),
        newPassword: passwordComplexity,
    }),
};
//# sourceMappingURL=auth-validator.js.map