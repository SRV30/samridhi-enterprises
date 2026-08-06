import express from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  validateCouponAtomic,
} from "../controllers/couponController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import validateSchema from "../middleware/validateSchema.js";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validators/couponSchemas.js";

const couponRouter = express.Router();

// User: validate/apply a coupon against their own cart.
couponRouter.post("/validate", auth, validateSchema(validateCouponSchema), validateCoupon);
couponRouter.post("/validate-atomic", auth, validateSchema(validateCouponSchema), validateCouponAtomic);

// Admin: full coupon management.
couponRouter.post("/admin/create", auth, admin, validateSchema(createCouponSchema), createCoupon);
couponRouter.get("/admin/get", auth, admin, getAllCoupons);
couponRouter.put("/admin/update/:id", auth, admin, validateSchema(updateCouponSchema), updateCoupon);
couponRouter.delete("/admin/delete/:id", auth, admin, deleteCoupon);

export default couponRouter;
