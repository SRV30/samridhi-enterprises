import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import Subscription from "../models/subscriptionModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import sendEmail from "../config/sendEmail.js";
import orderReceiptHtml from "../template/orderReceiptTemplate.js";
import generateAdminNewOrderEmail from "../template/adminNewOrderTemplate.js";
import notifyAdmins from "../utils/adminNotifier.js";

const REQUIRED_ADDRESS_FIELDS = ["fullName", "phone", "addressLine", "city", "pincode"];
const CUSTOMER_CANCELLABLE_STATUSES = ["Pending Verification", "Confirmed"];
const FULFILLMENT_STATUSES = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const VALID_TRANSITIONS = {
  "Pending Verification": ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

// Cancellation and inventory restoration are committed atomically. The conditional
// order update prevents concurrent requests from restoring the same stock twice.
const cancelOrderAndRestoreStock = async ({ orderId, userId, allowedStatuses, paymentStatus, rejectionReason }) => {
  const session = await mongoose.startSession();
  let cancelledOrder;
  try {
    await session.withTransaction(async () => {
      const lookup = { _id: orderId };
      if (userId) lookup.user = userId;
      const current = await Order.findOne(lookup).session(session);
      if (!current) throw new ErrorHandler("Order not found", 404);
      if (!allowedStatuses.includes(current.orderStatus)) {
        throw new ErrorHandler("This order is " + current.orderStatus + " and can no longer be cancelled.", 409);
      }
      const update = {
        $set: { orderStatus: "Cancelled", stockRestored: true, ...(paymentStatus ? { paymentStatus } : {}), ...(rejectionReason !== undefined ? { rejectionReason } : {}) },
        $push: { statusHistory: { status: "Cancelled", changedAt: new Date() } },
      };
      cancelledOrder = await Order.findOneAndUpdate(
        { _id: current._id, orderStatus: current.orderStatus, stockRestored: { $ne: true } },
        update,
        { new: true, session, runValidators: true }
      );
      if (!cancelledOrder) throw new ErrorHandler("This order was changed by another request. Refresh and try again.", 409);
      const stockOps = current.items.filter((item) => item.part && item.quantity > 0).map((item) => ({
        updateOne: { filter: { _id: item.part }, update: { $inc: { stock: item.quantity } } },
      }));
      if (stockOps.length) await Part.bulkWrite(stockOps, { ordered: true, session });
    });
    return cancelledOrder;
  } finally {
    await session.endSession();
  }
};

export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.part", "name price images stock");
  if (!cart || cart.items.length === 0) return next(new ErrorHandler("Your cart is empty", 400));

  const { fullName, phone, addressLine, city, state, pincode, upiReference, couponCode } = req.body;
  const paymentMethod = req.body.paymentMethod;
  const shippingAddress = { fullName, phone, addressLine, city, state, pincode };
  const missing = REQUIRED_ADDRESS_FIELDS.filter((field) => !shippingAddress[field] || !String(shippingAddress[field]).trim());

  if (missing.length) return next(new ErrorHandler(`Missing required address fields: ${missing.join(", ")}`, 400));
  if (!["COD", "Online"].includes(paymentMethod)) return next(new ErrorHandler("Payment method must be either COD or Online", 400));
  if (paymentMethod === "Online" && !req.file) return next(new ErrorHandler("Payment screenshot is required for online payment", 400));

  for (const item of cart.items) {
    if (!item.part) return next(new ErrorHandler("A product in your cart is no longer available", 400));
    if (item.part.stock < item.quantity) return next(new ErrorHandler(`Insufficient stock for ${item.part.name}`, 400));
  }

  const session = await mongoose.startSession();
  let uploadedScreenshotPublicId = "";
  let commitAttempted = false;
  session.startTransaction();
  try {
    const stockOps = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.part._id, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    const stockResult = await Part.bulkWrite(stockOps, { ordered: false, session });
    if (stockResult.modifiedCount !== cart.items.length) {
      throw new ErrorHandler("Insufficient stock for one or more items in your cart. Please review your cart and try again.", 400);
    }

    const items = cart.items.map((item) => ({
      part: item.part._id,
      name: item.name || item.part.name,
      price: item.part.price,
      quantity: item.quantity,
      image: item.part.images?.[0]?.url || "",
    }));
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discount = 0;
    let appliedCouponCode = "";
    if (couponCode && String(couponCode).trim()) {
      const coupon = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase() });
      if (!coupon) throw new ErrorHandler("Invalid coupon code", 400);
      const redeemable = coupon.isRedeemable();
      if (!redeemable.ok) throw new ErrorHandler(redeemable.reason, 400);
      discount = coupon.computeDiscount(itemsTotal);
      if (discount <= 0) throw new ErrorHandler("This coupon does not apply to your order", 400);
      const claim = await Coupon.findOneAndUpdate(
        {
          _id: coupon._id,
          isActive: true,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
          $expr: { $or: [{ $eq: ["$usageLimit", 0] }, { $lt: ["$usedCount", "$usageLimit"] }] },
        },
        { $inc: { usedCount: 1 } },
        { new: true, session }
      );
      if (!claim) throw new ErrorHandler("This coupon is no longer valid or has reached its usage limit", 400);
      appliedCouponCode = coupon.code;
    }

    let paymentScreenshot = { public_id: "", url: "" };
    if (paymentMethod === "Online") {
      const uploaded = await uploadImage(req.file);
      uploadedScreenshotPublicId = uploaded.public_id || "";
      paymentScreenshot = { public_id: uploadedScreenshotPublicId, url: uploaded.secure_url || uploaded.url || "" };
    }

    const orderStatus = paymentMethod === "Online" ? "Pending Verification" : "Confirmed";
    const paymentStatus = "Pending";
    const [order] = await Order.create([{
      user: req.user._id,
      items,
      shippingAddress,
      itemsTotal,
      couponCode: appliedCouponCode,
      discount,
      grandTotal: Math.max(0, itemsTotal - discount),
      paymentMethod,
      paymentStatus,
      orderStatus,
      paymentScreenshot,
      upiReference: upiReference || "",
      statusHistory: [{ status: orderStatus, changedAt: new Date() }],
    }], { session });

    await User.findByIdAndUpdate(req.user._id, { $push: { orderHistory: order._id } }, { session });
    cart.items = [];
    cart.total = 0;
    await cart.save({ session });
    commitAttempted = true;
    await session.commitTransaction();

    try {
      await sendEmail({
        sendTo: req.user.email,
        subject: paymentMethod === "COD" ? `Order Confirmed - ${order._id}` : `Order Received - Payment Verification Pending`,
        html: orderReceiptHtml(order, req.user),
      });
    } catch (mailErr) {
      console.error("Order email failed:", mailErr.message);
    }

    await notifyAdmins({
      preferenceKey: "notifyAdminsOnNewOrder",
      subject: paymentMethod === "Online" ? `New Order - Payment Verification Needed - ${order._id}` : `New Order Received - ${order._id}`,
      html: generateAdminNewOrderEmail(order, req.user),
    });

    return res.sendSuccess({
      message: paymentMethod === "COD" ? "Order placed successfully" : "Order placed. Payment is pending verification.",
      order,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (uploadedScreenshotPublicId && !commitAttempted) {
      try { await deleteImage(uploadedScreenshotPublicId); }
      catch (cleanupError) { console.error("Failed to clean up orphaned payment screenshot:", cleanupError.message); }
    }
    return next(error);
  } finally {
    await session.endSession();
  }
});

export const getMyOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.sendSuccess({ count: orders.length, orders });
});

export const getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.user.toString() !== req.user._id.toString()) return next(new ErrorHandler("Not authorized to view this order", 403));
  res.sendSuccess({ order });
});

export const cancelMyOrder = catchAsyncErrors(async (req, res) => {
  const order = await cancelOrderAndRestoreStock({
    orderId: req.params.id,
    userId: req.user._id,
    allowedStatuses: CUSTOMER_CANCELLABLE_STATUSES,
    rejectionReason: "Cancelled by customer",
  });
  res.sendSuccess({ message: "Order cancelled successfully", order });
});

export const adminGetAllOrders = catchAsyncErrors(async (req, res) => {
  const filter = req.query.status ? { orderStatus: req.query.status } : {};
  const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
  res.sendSuccess({ count: orders.length, orders });
});

export const adminVerifyPayment = catchAsyncErrors(async (req, res, next) => {
  const { action, rejectionReason } = req.body;
  if (!["approve", "reject"].includes(action)) return next(new ErrorHandler("Action must be either 'approve' or 'reject'", 400));
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.orderStatus !== "Pending Verification" || order.paymentStatus !== "Pending") return next(new ErrorHandler("Only orders awaiting payment verification can be approved or rejected", 400));

  if (action === "approve") {
    const approvedOrder = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: "Pending Verification", paymentStatus: "Pending" },
      { $set: { paymentStatus: "Success", orderStatus: "Confirmed", verifiedAt: new Date(), rejectionReason: "" }, $push: { statusHistory: { status: "Confirmed", changedAt: new Date() } } },
      { new: true, runValidators: true }
    ).populate("user", "name email");
    if (!approvedOrder) throw new ErrorHandler("This order was changed by another request. Refresh and try again.", 409);
    Object.assign(order, approvedOrder.toObject());
    try {
      await sendEmail({ sendTo: order.user?.email, subject: `Payment Verified - Receipt for Order ${order._id}`, html: orderReceiptHtml(order, order.user) });
    } catch (mailErr) {
      console.error("Receipt email failed:", mailErr.message);
    }
    return res.sendSuccess({ message: "Payment approved and order confirmed", order });
  }

  const rejectedOrder = await cancelOrderAndRestoreStock({
    orderId: req.params.id,
    allowedStatuses: ["Pending Verification"],
    paymentStatus: "Failed",
    rejectionReason: rejectionReason || "Payment could not be verified",
  });
  const rejectedWithUser = await Order.findById(rejectedOrder._id).populate("user", "name email");
  try {
    await sendEmail({
      sendTo: rejectedWithUser.user?.email,
      subject: `Payment Verification Failed - Order ${rejectedOrder._id}`,
      html: `<p>Payment verification failed for order <strong>${rejectedOrder._id}</strong>.</p><p>Reason: ${rejectedOrder.rejectionReason}</p>`,
    });
  } catch (mailErr) {
    console.error("Rejection email failed:", mailErr.message);
  }
  res.sendSuccess({ message: "Payment rejected and order cancelled", order: rejectedWithUser });
});

export const adminUpdateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const targetStatus = req.body.orderStatus || req.body.status;
  const { carrier, trackingNumber } = req.body;
  if (!targetStatus || !FULFILLMENT_STATUSES.includes(targetStatus)) return next(new ErrorHandler(`orderStatus must be one of: ${FULFILLMENT_STATUSES.join(", ")}`, 400));

  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return next(new ErrorHandler("Order not found", 404));
  const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
  if (targetStatus !== order.orderStatus && !allowed.includes(targetStatus)) return next(new ErrorHandler(`Invalid status transition from ${order.orderStatus} to ${targetStatus}.`, 400));
  if (order.paymentStatus !== "Success" && ["Processing", "Shipped", "Delivered"].includes(targetStatus)) return next(new ErrorHandler("Cannot advance fulfilment until the order's payment is verified", 400));

  const previousStatus = order.orderStatus;
  if (targetStatus === "Cancelled") {
    const cancelled = await cancelOrderAndRestoreStock({
      orderId: req.params.id,
      allowedStatuses: Object.keys(VALID_TRANSITIONS).filter((status) => VALID_TRANSITIONS[status].includes("Cancelled")),
    });
    const populated = await Order.findById(cancelled._id).populate("user", "name email");
    return res.sendSuccess({ message: "Order status updated to Cancelled", order: populated });
  }
  const setFields = { orderStatus: targetStatus };
  if (carrier !== undefined) setFields.carrier = carrier;
  if (trackingNumber !== undefined) setFields.trackingNumber = trackingNumber;
  const update = { $set: setFields };
  if (previousStatus !== targetStatus || !order.statusHistory.length) update.$push = { statusHistory: { status: targetStatus, changedAt: new Date() } };
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, orderStatus: previousStatus, paymentStatus: order.paymentStatus },
    update,
    { new: true, runValidators: true }
  ).populate("user", "name email");
  if (!updatedOrder) throw new ErrorHandler("This order was changed by another request. Refresh and try again.", 409);
  res.sendSuccess({ message: `Order status updated to ${targetStatus}`, order: updatedOrder });
});

export const createPartSubscription = catchAsyncErrors(async (req, res) => {
  const { partId, frequency } = req.body;
  const nextOrderDate = new Date();
  if (frequency === "weekly") nextOrderDate.setDate(nextOrderDate.getDate() + 7);
  else if (frequency === "monthly") nextOrderDate.setMonth(nextOrderDate.getMonth() + 1);
  const subscription = await Subscription.create({ user: req.user._id, part: partId, frequency, nextOrderDate });
  res.sendSuccess({ subscription }, 201);
});
