import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import upload from "../middleware/multer.js";
import validateSchema from "../middleware/validateSchema.js";
import {
  verifyPaymentSchema,
  updateOrderStatusSchema,
} from "../validators/orderSchemas.js";
import {
  createPartSubscription,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  adminGetAllOrders,
  adminVerifyPayment,
  adminUpdateOrderStatus,
} from "../controllers/orderController.js";
import {
  adminGetDashboardAnalytics,
  adminGetInventoryOverview,
  adminGetSalesAnalytics,
} from "../controllers/analyticsController.js";

const orderRouter = express.Router();

// Customer
orderRouter.post("/new", auth, upload.single("paymentScreenshot"), createOrder);
orderRouter.get("/my-orders", auth, getMyOrders);
orderRouter.put("/:id/cancel", auth, cancelMyOrder);

// Admin
orderRouter.get("/admin/all", auth, admin, adminGetAllOrders);
orderRouter.put("/admin/verify/:id", auth, admin, validateSchema(verifyPaymentSchema), adminVerifyPayment);
orderRouter.put("/admin/status/:id", auth, admin, validateSchema(updateOrderStatusSchema), adminUpdateOrderStatus);

// Admin — dashboard analytics & inventory
orderRouter.get("/admin/analytics", auth, admin, adminGetDashboardAnalytics);
orderRouter.get("/admin/inventory", auth, admin, adminGetInventoryOverview);

// Admin — sales analytics
orderRouter.get(
  "/admin/sales-analytics",
  auth,
  admin,
  adminGetSalesAnalytics
);

// Keep dynamic /:id route LAST
orderRouter.get("/:id", auth, getOrderById);

export default orderRouter;
