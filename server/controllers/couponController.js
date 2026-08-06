import Coupon from "../models/couponModel.js";
import Cart from "../models/cartModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// Shared validation for create/update. Mirrors the model constraints and adds
// the business rule that a PERCENTAGE discount can never exceed 100.
const validateCouponPayload = ({ discountType, discountValue }, partial) => {
  if (discountType !== undefined && !["PERCENTAGE", "FIXED"].includes(discountType)) {
    return "Discount type must be either PERCENTAGE or FIXED";
  }
  if (discountValue !== undefined) {
    if (typeof discountValue !== "number" || Number.isNaN(discountValue) || discountValue < 0) {
      return "Discount value must be a non-negative number";
    }
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return "A percentage discount cannot exceed 100";
    }
  }
  // On a partial update we may receive discountValue without discountType; in
  // that case the caller resolves the effective type before calling this.
  if (!partial && discountValue === undefined) {
    return "Discount value is required";
  }
  return null;
};

// ── Admin: create a coupon ────────────────────────────────────────────────
export const createCoupon = catchAsyncErrors(async (req, res, next) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiresAt,
    usageLimit,
    isActive,
  } = req.body;

  if (!code || !String(code).trim()) {
    return next(new ErrorHandler("Coupon code is required", 400));
  }
  if (!discountType) {
    return next(new ErrorHandler("Discount type is required", 400));
  }

  const payloadError = validateCouponPayload({ discountType, discountValue }, false);
  if (payloadError) return next(new ErrorHandler(payloadError, 400));

  const normalizedCode = String(code).trim().toUpperCase();
  const existing = await Coupon.findOne({ code: normalizedCode });
  if (existing) {
    return next(new ErrorHandler("A coupon with this code already exists", 400));
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    description: description || "",
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount ?? 0,
    maxDiscount: maxDiscount ?? 0,
    expiresAt: expiresAt || null,
    usageLimit: usageLimit ?? 0,
    isActive: isActive ?? true,
  });

  res.sendSuccess({ coupon }, 201);
});

// ── Admin: list all coupons ───────────────────────────────────────────────
export const getAllCoupons = catchAsyncErrors(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.sendSuccess({ coupons });
});

// ── Admin: update a coupon ────────────────────────────────────────────────
export const updateCoupon = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));

  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiresAt,
    usageLimit,
    isActive,
  } = req.body;

  // Resolve the effective discount type so the percentage cap is enforced even
  // when only one of {type, value} is supplied in a partial update.
  const effectiveType = discountType ?? coupon.discountType;
  const payloadError = validateCouponPayload(
    { discountType: effectiveType, discountValue },
    true
  );
  if (payloadError) return next(new ErrorHandler(payloadError, 400));

  if (code !== undefined && String(code).trim()) {
    const normalizedCode = String(code).trim().toUpperCase();
    if (normalizedCode !== coupon.code) {
      const clash = await Coupon.findOne({ code: normalizedCode });
      if (clash) {
        return next(new ErrorHandler("A coupon with this code already exists", 400));
      }
      coupon.code = normalizedCode;
    }
  }

  if (description !== undefined) coupon.description = description;
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt || null;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();
  res.sendSuccess({ coupon });
});

// ── Admin: delete a coupon ────────────────────────────────────────────────
export const deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  await coupon.deleteOne();
  res.sendSuccess({ message: "Coupon deleted" });
});

// ── User: validate a coupon against the current cart ──────────────────────
// Computes the discount server-side from the user's own cart subtotal so the
// client cannot influence the amount. Returns the discount and resulting total
// for display only — order creation re-validates independently.
import { CouponRulesEngine } from "../utils/couponRulesEngine.js";
import Order from "../models/orderModel.js";

export const validateCoupon = catchAsyncErrors(async (req, res, next) => {
  const { code } = req.body;
  if (!code || !String(code).trim()) {
    return next(new ErrorHandler("Please enter a coupon code", 400));
  }

  const coupon = await Coupon.findOne({
    code: String(code).trim().toUpperCase(),
  });
  if (!coupon) {
    return next(new ErrorHandler("Invalid coupon code", 404));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.partId");
  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler("Your cart is empty", 400));
  }

  const userUsageCount = await Order.countDocuments({
    user: req.user._id,
    "coupon.code": coupon.code,
  });

  const evaluation = CouponRulesEngine.evaluateCouponEligibility(coupon, {
    subtotal: cart.total || 0,
    items: cart.items,
    userUsageCount,
  });

  if (!evaluation.eligible) {
    return next(new ErrorHandler(evaluation.reason, 400));
  }

  const subtotal = cart.total || 0;
  const discount = evaluation.discount;

  res.sendSuccess({
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    subtotal,
    discount,
    payable: Math.max(0, subtotal - discount),
  });
});

// Added for #345: Validate and increment coupon usage atomically
import { verifyCouponLimitAtomic } from "../utils/couponUsageLock.js";
export const validateCouponAtomic = catchAsyncErrors(async (req, res, next) => {
  const { code } = req.body;
  const coupon = await verifyCouponLimitAtomic(Coupon, code.toUpperCase().trim());
  if (!coupon) {
    return next(new ErrorHandler("Coupon invalid or usage limit reached", 400));
  }
  res.sendSuccess({ message: "Coupon applied successfully", coupon });
});
