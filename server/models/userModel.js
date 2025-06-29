import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: [true, "Please Enter Your Password"] },
    avatar: { type: String, default: "" },
    mobile: {
      type: String,
      default: null,
    },
    verifyEmail: {
      type: Boolean,
      default: false,
    },
    login_otp: {
      type: String,
      default: null,
    },
    login_expiry: {
      type: Date,
      default: null,
    },
    failedAttempts: { type: Number, default: 0 },
    lastLogin: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Warning", "Suspended"],
      default: "Active",
    },
    addressDetails: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],
    shoppingCart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "cartProduct",
      },
    ],
    shoppingWishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "wishListProduct",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
