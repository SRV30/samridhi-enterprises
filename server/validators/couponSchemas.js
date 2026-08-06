import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  description: z.string().trim().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({ message: "Discount type must be PERCENTAGE or FIXED" }),
  }),
  discountValue: z.number().min(0, "Discount value must be a non-negative number"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Please enter a coupon code"),
});
