import mongoose from "mongoose";

// A promotional coupon that customers can apply at checkout. The discount is
// always recomputed server-side from these fields at validation and at order
// time, so a client can never dictate the discount amount it receives.
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please enter a coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },
    // For PERCENTAGE this is a percent (0-100); for FIXED it is a rupee amount.
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Minimum order subtotal required for the coupon to apply.
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Optional cap on the rupee discount a PERCENTAGE coupon can grant.
    // 0 means "no cap".
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    // Total number of times this coupon may be redeemed across all users.
    // 0 means "unlimited".
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    perUserLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

couponSchema.index({ discountType: 1, isActive: 1 });

// Compute the rupee discount this coupon grants for a given order subtotal.
// Returns 0 when the coupon does not apply to that subtotal. This is the single
// source of truth for discount math, used by both validate and order creation.
couponSchema.methods.computeDiscount = function (subtotal) {
  if (subtotal < this.minOrderAmount) return 0;

  let discount =
    this.discountType === "PERCENTAGE"
      ? (subtotal * this.discountValue) / 100
      : this.discountValue;

  if (this.maxDiscount > 0) {
    discount = Math.min(discount, this.maxDiscount);
  }
  // Never discount more than the order is worth.
  discount = Math.min(discount, subtotal);
  return Math.round(discount * 100) / 100;
};

// Whether the coupon is currently redeemable (active, not expired, under limit).
couponSchema.methods.isRedeemable = function () {
  if (!this.isActive) return { ok: false, reason: "This coupon is not active" };
  if (this.expiresAt && this.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "This coupon has expired" };
  }
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { ok: false, reason: "This coupon has reached its usage limit" };
  }
  return { ok: true, reason: "" };
};

export default mongoose.model("Coupon", couponSchema);
