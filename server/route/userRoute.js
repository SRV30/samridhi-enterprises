import express from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getSingleUser,
  getUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  updatePassword,
  updateUserDetails,
  updateUserRole,
  updateUserStatus,
  uploadAvatar,
  verifyEmailOtp,
  verifyOtp,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import admin from "../middleware/Admin.js";
import { createAuthOtpLimiter } from "../middleware/rateLimiter.js";
import validateSchema from "../middleware/validateSchema.js";
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/authSchemas.js";

const userRouter = express.Router();

// Auth/OTP brute-force protection: stricter fixed-window limits per IP and (optionally) per email.
const authOtpIpLimit = createAuthOtpLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxByIp: 10,
  maxByEmail: 5,
  enableEmail: true,
  logInDev: true,
  message: "Too many requests. Please try again later.",
});

userRouter.post("/register", authOtpIpLimit, validateSchema(registerSchema), registerUser);

userRouter.post("/verify-email", authOtpIpLimit, validateSchema(otpVerifySchema), verifyEmailOtp);

userRouter.post("/resend-otp", authOtpIpLimit, validateSchema(resendOtpSchema), resendOtp);

userRouter.post("/login", authOtpIpLimit, validateSchema(loginSchema), loginUser);

userRouter.get("/logout", logoutUser);

userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);

userRouter.put("/update/password", auth, validateSchema(updatePasswordSchema), updatePassword);

userRouter.put("/forgot-password", authOtpIpLimit, validateSchema(forgotPasswordSchema), forgotPassword);

userRouter.put("/verify-otp", authOtpIpLimit, validateSchema(otpVerifySchema), verifyOtp);

userRouter.put("/reset-password", authOtpIpLimit, validateSchema(resetPasswordSchema), resetPassword);

userRouter.get("/me", auth, getUserDetails);

userRouter.put(
  "/update-user",
  auth,
  upload.single("avatar"),
  updateUserDetails
);

userRouter.get("/admin/get", auth, admin, getAllUsers);

userRouter.get("/admin/get/:id", auth, admin, getSingleUser);

import { auditLoggerMiddleware } from "../middleware/auditLoggerMiddleware.js";

userRouter.put("/admin/update", authOtpIpLimit, auth, admin, auditLoggerMiddleware("user", "UPDATE_ROLE"), updateUserRole);

userRouter.delete("/admin/delete/:id", authOtpIpLimit, auth, admin, auditLoggerMiddleware("user", "DELETE_USER"), deleteUser);

userRouter.patch("/admin/:id/status", authOtpIpLimit, auth, admin, auditLoggerMiddleware("user", "UPDATE_STATUS"), updateUserStatus);

export default userRouter;
