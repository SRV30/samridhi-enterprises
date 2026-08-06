import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ROLES, ROLES_ARRAY } from "../../shared/constants/permissions.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
    },
    avatar: {
      type: String,
      default: "",
    },
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
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
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
    forgot_password_failedAttempts: {
      type: Number,
      default: 0,
    },
    forgot_password_lockUntil: {
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
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
    role: {
      type: String,
      enum: ROLES_ARRAY,
      default: ROLES.USER,
    },

    // Soft delete / audit trail support
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Hash password before saving (on .save() calls)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Safety net: hash password if updated via findOneAndUpdate / findByIdAndUpdate.
// This prevents future changes that bypass .save() from persisting plaintext passwords.
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (!update || !update.password) return;

  update.password = await bcrypt.hash(update.password, 12);
  this.setUpdate(update);
});

import config from "../config/index.js";

userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    config.jwt.secret || process.env.JWT_SECRET,
    {
      expiresIn: config.jwt.expire || process.env.JWT_EXPIRE,
    }
  );
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
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
