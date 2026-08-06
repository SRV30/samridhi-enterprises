import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const otpVerifySchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  otp: z.string().trim().min(1, "OTP is required"),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  otp: z.string().trim().min(1, "OTP is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

export const updateUserRoleSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  role: z.enum(["USER", "ADMIN", "MANAGER"], {
    errorMap: () => ({ message: "Role must be USER, ADMIN, or MANAGER" }),
  }),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["Active", "Warning", "Suspended"], {
    errorMap: () => ({ message: "Status must be Active, Warning, or Suspended" }),
  }),
});
