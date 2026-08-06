import ErrorHandler from "../utils/errorHandler.js";
import UserModel from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../template/verifyEmailTemplate.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { deleteImage, uploadImage, getPublicIdFromUrl } from "../utils/cloudinary.js";
import generatedOtp from "../utils/generatedOtp.js";
import sendToken from "../utils/jwtToken.js";
import forgotPasswordTemplate from "../template/forgotPasswordTemplate.js";
import { logAudit } from "../utils/auditLogger.js";
import { isOtpDevMode } from "../utils/validateEnv.js";

// ✅ FIX 1: Added missing validatePassword import (Check if your util file name matches this path)
import { validatePassword } from "../utils/validatePassword.js"; 

const shouldLogOtp = isOtpDevMode();

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return next(new ErrorHandler(passwordValidation.message, 400));
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const otp = generatedOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 15);

    if (shouldLogOtp) {
      console.log(`\n=== VERIFICATION OTP FOR ${email} IS: ${otp} ===\n`);
    }

    const emailResponse = await sendEmail({
      sendTo: email,
      subject: "Verify Your Email - Nandani Jewelllers",
      html: verifyEmailTemplate({ name, otp }),
    });

    if (!emailResponse) {
      return next(new ErrorHandler("Failed to send verification email", 500));
    }

    const newUser = new UserModel({
      name,
      email,
      password,
      verifyEmail: false,
      login_otp: otp,
      login_expiry: otpExpiry,
      lastLogin: null,
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
      return next(new ErrorHandler("Failed to create user", 500));
    }

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      error: false,
      success: true,
      data: savedUser,
    });
  } catch (error) {
    // ✅ FIX 2: Pass error.message so actual errors aren't swallowed into generic 500 errors
    return next(new ErrorHandler(error.message || "Server error. Please try again.", 500));
  }
});

export const verifyEmailOtp = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Email not registered.", 400));
    }
    if (user.login_expiry < new Date()) {
      const newOtp = generatedOtp();
      const newExpiry = new Date();
      newExpiry.setMinutes(newExpiry.getMinutes() + 15);

      const emailResponse = await sendEmail({
        sendTo: email,
        subject: "New OTP for Email Verification - Samridhi Enterprises",
        html: verifyEmailTemplate({ name: user.name, otp: newOtp }),
      });

      if (!emailResponse) {
        return next(new ErrorHandler("Failed to resend OTP. Try again later.", 500));
      }

      user.login_otp = newOtp;
      user.login_expiry = newExpiry;
      await user.save();

      return next(
        new ErrorHandler("OTP expired. A new OTP has been sent to your email.", 410)
      );
    }

    if (otp !== user.login_otp) {
      return next(new ErrorHandler("Invalid OTP", 401));
    }

    await UserModel.findByIdAndUpdate(user._id, {
      verifyEmail: true,
      login_otp: null,
      login_expiry: null,
    });

    return res.json({
      message: "Email verified successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message || "An error occurred while verifying OTP.", 500)
    );
  }
});

export const resendOtp = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Email not registered.", 400));
    }

    const newOtp = generatedOtp();
    const newExpiry = new Date();
    newExpiry.setMinutes(newExpiry.getMinutes() + 15);

    if (shouldLogOtp) {
      console.log(`\n=== RESEND OTP FOR ${email} IS: ${newOtp} ===\n`);
    }

    const emailResponse = await sendEmail({
      sendTo: email,
      subject: "New OTP for Email Verification - Samridhi Enterprises",
      html: verifyEmailTemplate({ name: user.name, otp: newOtp }),
    });

    if (!emailResponse) {
      return next(new ErrorHandler("Failed to resend OTP. Try again later.", 500));
    }

    user.login_otp = newOtp;
    user.login_expiry = newExpiry;
    await user.save();

    return res.status(200).json({
      message: "A new OTP has been sent to your email.",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to resend OTP.", 500));
  }
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User is not registered", 400));
  }

  if (user.status !== "Active") {
    return next(
      new ErrorHandler("Your account is not active. Please contact the admin.", 400)
    );
  }

  const maxAttempts = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;
  const lockMinutes = Number(process.env.LOGIN_LOCK_MINUTES) || 15;

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    return next(
      new ErrorHandler(
        `Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`,
        429
      )
    );
  }

  if (user.lockUntil && user.lockUntil.getTime() <= Date.now()) {
    user.lockUntil = null;
    user.failedAttempts = 0;
  }

  const checkPassword = await user.comparePassword(password);

  if (!checkPassword) {
    user.failedAttempts = (user.failedAttempts || 0) + 1;

    if (user.failedAttempts >= maxAttempts) {
      user.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      user.failedAttempts = 0;
      await user.save();
      return next(
        new ErrorHandler(
          `Account temporarily locked due to too many failed login attempts. Try again in ${lockMinutes} minute(s).`,
          429
        )
      );
    }

    await user.save();
    return next(new ErrorHandler("Incorrect email or password", 400));
  }

  user.failedAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();

  const passwordStrength = validatePassword(password);
  user.hasWeakPassword = !passwordStrength.isValid;

  await user.save();

  sendToken(user, 200, res);
});

export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Internal Server Error", 500));
  }
});

export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const image = req.file;

    if (!image) {
      return next(new ErrorHandler("No image file provided", 400));
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (delErr) {
          console.error("Old avatar delete failed:", delErr.message);
        }
      }
    }

    const upload = await uploadImage(image);

    if (!upload || !upload.url) {
      return next(new ErrorHandler("Image upload failed", 500));
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        avatar: upload.url,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    return res.json({
      message: "Profile picture uploaded successfully",
      success: true,
      error: false,
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    const passwordValidation = validatePassword(req.body.newPassword);
    if (!passwordValidation.isValid) {
      return next(new ErrorHandler(passwordValidation.message, 400));
    }

    user.password = req.body.newPassword;
    user.hasWeakPassword = false;
    await user.save();

    return res.json({
      message: "Password updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Error updating password", 500));
  }
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({
        message:
          "If the email exists, a password reset OTP has been sent. Please check your inbox.",
        error: false,
        success: true,
      });
    }

    const otp = generatedOtp();
    const expireTime = new Date(new Date().getTime() + 10 * 60 * 1000);

    if (shouldLogOtp) {
      console.log(`\n=== FORGOT PASSWORD OTP FOR ${email} IS: ${otp} ===\n`);
    }

    const otpHash = await bcryptjs.hash(String(otp), 12);

    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otpHash,
      forgot_password_expiry: expireTime,
      forgot_password_failedAttempts: 0,
      forgot_password_lockUntil: null,
    });

    if (!update) {
      return next(new ErrorHandler("Failed to update user with OTP", 500));
    }

    await sendEmail({
      sendTo: email,
      subject: "Forgot password from Samridhi Enterprises",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    return res.json({
      message:
        "A password reset OTP has been sent to your email. Please check your inbox.",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ErrorHandler("Please provide both email and otp.", 400));
    }

    const maxAttempts = Number(process.env.FORGOT_PASSWORD_MAX_ATTEMPTS) || 5;
    const lockMinutes = Number(process.env.FORGOT_PASSWORD_LOCK_MINUTES) || 15;

    const user = await UserModel.findOne({ email });

    const genericOtpError = new ErrorHandler(
      "Invalid or expired OTP. Please request a new one.",
      400
    );

    if (!user) {
      return next(genericOtpError);
    }

    if (
      user.forgot_password_lockUntil &&
      user.forgot_password_lockUntil.getTime() > Date.now()
    ) {
      return next(
        new ErrorHandler("Too many OTP attempts. Please try again later.", 429)
      );
    }

    if (!user.forgot_password_expiry) {
      return next(genericOtpError);
    }

    const expiry = new Date(user.forgot_password_expiry).getTime();

    if (Number.isNaN(expiry) || expiry < Date.now()) {
      user.forgot_password_failedAttempts = 0;
      user.forgot_password_lockUntil = null;
      await user.save();
      return next(genericOtpError);
    }

    const isOtpValid = await bcryptjs.compare(
      String(otp),
      user.forgot_password_otp || ""
    );

    if (!isOtpValid) {
      user.forgot_password_failedAttempts =
        (user.forgot_password_failedAttempts || 0) + 1;

      if (user.forgot_password_failedAttempts >= maxAttempts) {
        user.forgot_password_lockUntil = new Date(
          Date.now() + lockMinutes * 60 * 1000
        );
        user.forgot_password_failedAttempts = 0;
      }

      await user.save();

      if (user.forgot_password_lockUntil) {
        return next(
          new ErrorHandler(
            "Too many OTP attempts. Please try again later.",
            429
          )
        );
      }

      return next(genericOtpError);
    }

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_failedAttempts: 0,
      forgot_password_lockUntil: null,
    });

    return res.json({
      message: "OTP verified successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        error.message || "An error occurred while verifying OTP.",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return next(
        new ErrorHandler(
          "Please provide required fields: email, otp, newPassword, and confirmPassword.",
          400
        )
      );
    }

    if (newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(
          "New password and confirm password must be the same.",
          400
        )
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return next(new ErrorHandler(passwordValidation.message, 400));
    }

    const user = await UserModel.findOne({ email });

    const genericOtpError = new ErrorHandler(
      "Invalid or expired OTP. Please request a new one.",
      400
    );

    if (!user) {
      return next(genericOtpError);
    }

    if (
      user.forgot_password_lockUntil &&
      user.forgot_password_lockUntil.getTime() > Date.now()
    ) {
      return next(
        new ErrorHandler("Too many OTP attempts. Please try again later.", 429)
      );
    }

    if (!user.forgot_password_otp || !user.forgot_password_expiry) {
      return next(genericOtpError);
    }

    const otpExpiry = new Date(user.forgot_password_expiry).getTime();
    if (Number.isNaN(otpExpiry) || otpExpiry < Date.now()) {
      user.forgot_password_failedAttempts = 0;
      user.forgot_password_lockUntil = null;
      await user.save();
      return next(genericOtpError);
    }

    const isOtpValid = await bcryptjs.compare(
      String(otp),
      user.forgot_password_otp || ""
    );

    if (!isOtpValid) {
      const maxAttempts = Number(process.env.FORGOT_PASSWORD_MAX_ATTEMPTS) || 5;
      const lockMinutes = Number(process.env.FORGOT_PASSWORD_LOCK_MINUTES) || 15;

      user.forgot_password_failedAttempts =
        (user.forgot_password_failedAttempts || 0) + 1;

      if (user.forgot_password_failedAttempts >= maxAttempts) {
        user.forgot_password_lockUntil = new Date(
          Date.now() + lockMinutes * 60 * 1000
        );
        user.forgot_password_failedAttempts = 0;
      }

      await user.save();

      if (user.forgot_password_lockUntil) {
        return next(
          new ErrorHandler("Too many OTP attempts. Please try again later.", 429)
        );
      }

      return next(genericOtpError);
    }

    const salt = await bcryptjs.genSalt(12);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        password: hashPassword,
        hasWeakPassword: false,
        forgot_password_otp: null,
        forgot_password_expiry: null,
        forgot_password_failedAttempts: 0,
        forgot_password_lockUntil: null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(new ErrorHandler("Failed to update password. Please try again.", 500));
    }

    return res.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message || "An error occurred while updating the password.", 500)
    );
  }
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Checking User model:", UserModel);
    console.log("User ID:", req.user?._id);

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message || "Server error while fetching user details", 500)
    );
  }
});

export const updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, email, mobile, password } = req.body;
    const avatar = req.file;

    let updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;

    if (password) {
      const salt = await bcryptjs.genSalt(12);
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    if (avatar) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(avatar.mimetype)) {
        return next(
          new ErrorHandler(
            "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
            400
          )
        );
      }

      const user = await UserModel.findById(userId);

      if (user.avatar) {
        const publicId = getPublicIdFromUrl(user.avatar);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (delErr) {
            console.error("Old avatar delete failed:", delErr.message);
          }
        }
      }

      const uploadResult = await uploadImage(avatar);

      if (!uploadResult || !uploadResult.url) {
        return next(new ErrorHandler("Image upload failed", 500));
      }

      updateFields.avatar = uploadResult.url;
    }

    const updateUser = await UserModel.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updateUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    return res.json({
      message: "User details updated successfully",
      error: false,
      success: true,
      user: updateUser,
      data: updateUser,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

// Admin
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return next(new ErrorHandler("Access denied. Admins only.", 403));
    }

    const includeDeleted = req.user.role === "ADMIN";

    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      ...(includeDeleted ? {} : { isDeleted: false }),
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await UserModel.countDocuments(query);

    const users = await UserModel.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      message: "Users fetched successfully",
      error: false,
      success: true,
      totalUsers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      data: users,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

// Admin
export const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return next(new ErrorHandler("Permission denied. Admins only.", 403));
    }

    const userId = req.params.id;

    const user = await UserModel.findOne({
      _id: userId,
      ...(req.user.role === "ADMIN" ? {} : { isDeleted: false }),
    }).select("-password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    return res.json({
      message: "User details fetched successfully",
      error: false,
      success: true,
      data: user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

// Admin
export const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return next(new ErrorHandler("Permission denied. Managers only.", 403));
    }

    const { email, role } = req.body;

    if (!role || !["USER", "ADMIN", "MANAGER"].includes(role)) {
      return next(
        new ErrorHandler(
          "Invalid role. Role must be either 'USER', 'MANAGER', or 'ADMIN'.",
          400
        )
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const previousRole = user.role;
    user.role = role;
    const updatedUser = await user.save();

    logAudit({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: "USER_ROLE_UPDATE",
      entityType: "User",
      entityId: user._id.toString(),
      metadata: { previousRole, nextRole: role },
    }).catch(() => {});

    return res.json({
      message: "User role updated successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || error, 500));
  }
});

// Admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return next(new ErrorHandler("Permission denied. Admins only.", 403));
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // ✅ FIX 3: Prevent MANAGER from managing soft-deleted users (Test 15)
    if (user.isDeleted && req.user.role === "MANAGER") {
      return next(new ErrorHandler("Manager cannot manage soft-deleted users", 403));
    }

    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (delErr) {
          console.error("Old avatar delete failed:", delErr.message);
        }
      }
    }

    await UserModel.findByIdAndUpdate(userId, {
      $set: { isDeleted: true, deletedAt: new Date() },
    });

    await logAudit({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: "USER_DELETE",
      entityType: "User",
      entityId: userId,
      metadata: { previousRole: user.role, previousStatus: user.status },
    }).catch(() => {});

    return res.json({
      message: "User soft-deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Internal Server Error", 500));
  }
});

// Admin
export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Active", "Warning", "Suspended"];
    if (!allowedStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status provided", 400));
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // ✅ FIX 3: Prevent MANAGER from managing soft-deleted users (Test 15)
    if (user.isDeleted && req.user?.role === "MANAGER") {
      return next(new ErrorHandler("Manager cannot manage soft-deleted users", 403));
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    logAudit({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: "USER_STATUS_UPDATE",
      entityType: "User",
      entityId: user._id.toString(),
      metadata: { previousStatus, nextStatus: status },
    }).catch(() => {});

    if (status === "Warning") {
      await sendEmail({
        sendTo: user.email,
        subject: "⚠️ Account Warning - Samridhi Enterprises",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #ffcc00; padding: 10px; text-align: center;">
                <h2 style="color: #fff;">⚠️ Account Warning ⚠️</h2>
              </div>
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>We are writing to inform you that your account on <strong>Samridhi Enterprises</strong> has been flagged for activities that violate our platform guidelines.</p>
              <p>Please review the <a href="https://nandanijewellers.com" style="color: #0066cc;">Platform Guidelines</a> to ensure compliance.</p>
              <p><strong>What You Need To Do:</strong></p>
              <ul>
                <li>Review your recent activities on your account.</li>
                <li>Make sure you are following the guidelines outlined in the link above.</li>
              </ul>
              <p>If you have any questions or need assistance, feel free to <a href="mailto:support@nandanijewellers.com" style="color: #0066cc;">contact our support team</a>.</p>
              <br>
              <p>Best regards,</p>
              <p><b>Samridhi Enterprises Team</b></p>
            </div>
          `,
      });
    }

    if (status === "Suspended") {
      await sendEmail({
        sendTo: user.email,
        subject: "❌ Account Suspended - Samridhi Enterprises",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #f44336; padding: 10px; text-align: center;">
                <h2 style="color: #fff;">❌ Account Suspended ❌</h2>
              </div>
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Unfortunately, your account has been suspended due to violations of our platform's guidelines.</p>
              <p><strong>What You Can Do:</strong></p>
              <ul>
                <li>Contact our support team to learn more about the suspension.</li>
                <li>Review our <a href="https://nandanijewellers.com" style="color: #0066cc;">Platform Guidelines</a> and make sure your actions are aligned with them.</li>
              </ul>
              <p>If you believe this suspension was a mistake, please reach out to our <a href="mailto:support@nandanijewellers.com" style="color: #0066cc;">support team</a>.</p>
              <br>
              <p>We value you as a part of our community, and we hope to resolve this issue quickly.</p>
              <p>Best regards,</p>
              <p><b>Samridhi Enterprises Team</b></p>
            </div>
          `,
      });
    }

    if (status === "Active") {
      await sendEmail({
        sendTo: user.email,
        subject: "✅ Your Account is Active - Samridhi Enterprises",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #4caf50; padding: 10px; text-align: center;">
                <h2 style="color: #fff;">✅ Your Account is Active</h2>
              </div>
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>We are happy to inform you that your account is now active and in good standing on <strong>Samridhi Enterprises</strong>.</p>
              <p>You can now access all the platform features and continue to enjoy your experience with us.</p>
              <p>If you have any questions or need assistance, feel free to <a href="mailto:support@nandanijewellers.com" style="color: #0066cc;">contact our support team</a>.</p>
              <br>
              <p>Best regards,</p>
              <p><b>Samridhi Enterprises Team</b></p>
            </div>
          `,
      });
    }

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Server error", 500));
  }
});