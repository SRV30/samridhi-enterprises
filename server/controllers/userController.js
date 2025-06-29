import UserModel from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../template/verifyEmailTemplate.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import generatedOtp from "../utils/generatedOtp.js";
import sendToken from "../utils/jwtToken.js";
import forgotPasswordTemplate from "../template/forgotPasswordTemplate.js";

export const registerUser = catchAsyncErrors(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
        error: true,
        success: false,
      });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
        error: true,
        success: false,
      });
    }

    const otp = generatedOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 15);

    const emailResponse = await sendEmail({
      sendTo: email,
      subject: "Verify Your Email - Nandani Jewelllers",
      html: verifyEmailTemplate({ name, otp }),
    });

    if (!emailResponse) {
      return res.status(500).json({
        message: "Failed to send verification email",
        error: true,
        success: false,
      });
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
      return res.status(500).json({
        message: "Failed to create user",
        error: true,
        success: false,
      });
    }

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      error: false,
      success: true,
      data: savedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error. Please try again.",
      error: true,
      success: false,
    });
  }
});

export const verifyEmailOtp = catchAsyncErrors(async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered.",
        error: true,
        success: false,
      });
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
        return res.status(500).json({
          message: "Failed to resend OTP. Try again later.",
          error: true,
          success: false,
        });
      }

      user.login_otp = newOtp;
      user.login_expiry = newExpiry;
      await user.save();

      return res.status(410).json({
        message: "OTP expired. A new OTP has been sent to your email.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.login_otp) {
      return res.status(401).json({ message: "Invalid OTP", error: true });
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
    return res.status(500).json({
      message: error.message || "An error occurred while verifying OTP.",
      error: true,
      success: false,
    });
  }
});

export const resendOtp = catchAsyncErrors(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered.",
        error: true,
        success: false,
      });
    }

    const newOtp = generatedOtp();
    const newExpiry = new Date();
    newExpiry.setMinutes(newExpiry.getMinutes() + 15);

    const emailResponse = await sendEmail({
      sendTo: email,
      subject: "New OTP for Email Verification - Samridhi Enterprises",
      html: verifyEmailTemplate({ name: user.name, otp: newOtp }),
    });

    if (!emailResponse) {
      return res.status(500).json({
        message: "Failed to resend OTP. Try again later.",
        error: true,
        success: false,
      });
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
    return res.status(500).json({
      message: error.message || "Failed to resend OTP.",
      error: true,
      success: false,
    });
  }
});

export const loginUser = catchAsyncErrors(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
      error: true,
    });
  }

  const user = await UserModel.findOne({ email }).select("+password");
  console.log("User Found:", user);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User is not registered",
      error: true,
    });
  }

  if (user.status !== "Active") {
    return res.status(400).json({
      success: false,
      message: "Your account is not active. Please contact the admin.",
      error: true,
    });
  }

  const checkPassword = await user.comparePassword(password);

  if (!checkPassword) {
    return res.status(400).json({
      success: false,
      message: "Incorrect email or password",
      error: true,
    });
  }

  user.lastLogin = new Date();
  await user.save();

  sendToken(user, 200, res);
});

export const logoutUser = catchAsyncErrors(async (req, res) => {
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
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
});

export const uploadAvatar = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        message: "No image file provided",
        success: false,
        error: true,
      });
    }

    const upload = await uploadImage(image);

    if (!upload || !upload.url) {
      return res.status(500).json({
        message: "Image upload failed",
        success: false,
        error: true,
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        avatar: upload.url,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
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
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
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

    user.password = req.body.newPassword;
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

export const forgotPassword = catchAsyncErrors(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const otp = generatedOtp();
    const expireTime = new Date(new Date().getTime() + 10 * 60 * 1000);

    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    });

    if (!update) {
      return res.status(500).json({
        message: "Failed to update user with OTP",
        error: true,
        success: false,
      });
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
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const verifyOtp = catchAsyncErrors(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide both email and otp.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not registered.",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "Otp has expired. Please req a new one.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid otp. Please try again.",
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: "",
    });

    return res.json({
      message: "OTP verified successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "An error occurred while verifying OTP.",
      error: true,
      success: false,
    });
  }
});

export const resetPassword = catchAsyncErrors(async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Please provide required fields: email, newPassword, and confirmPassword.",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password must be the same.",
        error: true,
        success: false,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not found.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        password: hashPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        message: "Failed to update password. Please try again.",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "An error occurred while updating the password.",
      error: true,
      success: false,
    });
  }
});

export const getUserDetails = catchAsyncErrors(async (req, res) => {
  try {
    console.log("Checking User model:", UserModel);

    console.log("User ID:", req.user?._id);

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error while fetching user details",
      error: true,
      success: false,
    });
  }
});

export const updateUserDetails = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, mobile, password } = req.body;
    const avatar = req.file;

    let updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    if (avatar) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(avatar.mimetype)) {
        return res.status(400).json({
          message: "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
          error: true,
          success: false,
        });
      }

      const user = await UserModel.findById(userId);

      if (user.avatar) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await deleteImage(`nj/${publicId}`);
      }

      const uploadResult = await uploadImage(avatar);

      if (!uploadResult || !uploadResult.url) {
        return res.status(500).json({
          message: "Image upload failed",
          error: true,
          success: false,
        });
      }

      updateFields.avatar = uploadResult.url;
    }

    const updateUser = await UserModel.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updateUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User details updated successfully",
      error: false,
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

// Admin
export const getAllUsers = catchAsyncErrors(async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        error: true,
        success: false,
      });
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {
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
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

// Admin
export const getSingleUser = catchAsyncErrors(async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Permission denied. Admins only.",
        error: true,
        success: false,
      });
    }

    const userId = req.params.id;

    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User details fetched successfully",
      error: false,
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

// Admin
export const updateUserRole = catchAsyncErrors(async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Permission denied. Managers only.",
        error: true,
        success: false,
      });
    }

    const { email, role } = req.body;

    if (!role || !["USER", "ADMIN", "MANAGER"].includes(role)) {
      return res.status(400).json({
        message:
          "Invalid role. Role must be either 'USER', 'MANAGER', or 'ADMIN'.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    user.role = role;
    const updatedUser = await user.save();

    return res.json({
      message: "User role updated successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

// Admin
export const deleteUser = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Permission denied. Admins only.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];

      await deleteImage(`ff/${publicId}`);
    }

    await UserModel.findByIdAndDelete(userId);

    return res.json({
      message: "User and avatar deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
});

// Admin
export const updateUserStatus = catchAsyncErrors(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Active", "Warning", "Suspended"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status provided" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.status = status;
    await user.save();

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
    res.status(500).json({ error: "Server error" });
  }
});
