import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import Subscription from "../models/subscriptionModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { uploadImage } from "../utils/cloudinary.js";
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

const restoreOrderStock = async (order) => {
  if (order.stockRestored) return;
  for (const item of order.items) {
    if (item.part) await Part.findByIdAndUpdate(item.part, { $inc: { stock: item.quantity } });
  }
  order.stockRestored = true;
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
      paymentScreenshot = { public_id: uploaded.public_id || "", url: uploaded.secure_url || uploaded.url || "" };
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

export const cancelMyOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.user.toString() !== req.user._id.toString()) return next(new ErrorHandler("Not authorized to cancel this order", 403));
  if (order.orderStatus === "Cancelled") return next(new ErrorHandler("This order is already cancelled", 400));
  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus)) return next(new ErrorHandler(`This order is ${order.orderStatus} and can no longer be cancelled.`, 400));

  order.orderStatus = "Cancelled";
  order.rejectionReason = "Cancelled by customer";
  order.statusHistory.push({ status: "Cancelled", changedAt: new Date() });
  await restoreOrderStock(order);
  await order.save();
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
  if (order.orderStatus === "Cancelled" || order.paymentStatus === "Failed") return next(new ErrorHandler("Order is already cancelled or payment rejected", 400));

  if (action === "approve") {
    order.paymentStatus = "Success";
    order.orderStatus = "Confirmed";
    order.verifiedAt = new Date();
    order.rejectionReason = "";
    order.statusHistory.push({ status: "Confirmed", changedAt: new Date() });
    await order.save();
    try {
      await sendEmail({ sendTo: order.user?.email, subject: `Payment Verified - Receipt for Order ${order._id}`, html: orderReceiptHtml(order, order.user) });
    } catch (mailErr) {
      console.error("Receipt email failed:", mailErr.message);
    }
    return res.sendSuccess({ message: "Payment approved and order confirmed", order });
  }

  order.paymentStatus = "Failed";
  order.orderStatus = "Cancelled";
  order.rejectionReason = rejectionReason || "Payment could not be verified";
  order.statusHistory.push({ status: "Cancelled", changedAt: new Date() });
  await restoreOrderStock(order);
  await order.save();
  try {
    await sendEmail({
      sendTo: order.user?.email,
      subject: `Payment Verification Failed - Order ${order._id}`,
      html: `<p>Payment verification failed for order <strong>${order._id}</strong>.</p><p>Reason: ${order.rejectionReason}</p>`,
    });
  } catch (mailErr) {
    console.error("Rejection email failed:", mailErr.message);
  }
  res.sendSuccess({ message: "Payment rejected and order cancelled", order });
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
  order.orderStatus = targetStatus;
  if (carrier !== undefined) order.carrier = carrier;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (previousStatus !== targetStatus || !order.statusHistory.length) order.statusHistory.push({ status: targetStatus, changedAt: new Date() });
  if (targetStatus === "Cancelled") await restoreOrderStock(order);
  await order.save();
  res.sendSuccess({ message: `Order status updated to ${targetStatus}`, order });
});

export const createPartSubscription = catchAsyncErrors(async (req, res) => {
  const { partId, frequency } = req.body;
  const nextOrderDate = new Date();
  if (frequency === "weekly") nextOrderDate.setDate(nextOrderDate.getDate() + 7);
  else if (frequency === "monthly") nextOrderDate.setMonth(nextOrderDate.getMonth() + 1);
  const subscription = await Subscription.create({ user: req.user._id, part: partId, frequency, nextOrderDate });
  res.sendSuccess({ subscription }, 201);
});
