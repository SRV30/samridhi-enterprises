import { validateAndFetchFreshPrices } from "../utils/cartPricingValidator.js";
import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { uploadImage } from "../utils/cloudinary.js";
import sendEmail from "../config/sendEmail.js";
import orderReceiptHtml from "../template/orderReceiptTemplate.js";
import generateReceiptHTML from "../template/generateReceipt.js";
import generateAdminNewOrderEmail from "../template/adminNewOrderTemplate.js";
import notifyAdmins from "../utils/adminNotifier.js";
import { validateCheckoutPriceIntegrity } from "../utils/checkoutPriceValidator.js";

const REQUIRED_ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "addressLine",
  "city",
  "pincode",
];

// POST /api/orders/new  (auth, multipart: optional "paymentScreenshot")
// Creates an order from the logged-in user's cart. COD orders are confirmed
// immediately; Online orders require a payment screenshot and enter the
// "Pending Verification" state until an admin approves them.
export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.part",
    "name price images stock"
  );

  if (!cart || cart.items.length === 0) {
    return next(new ErrorHandler("Your cart is empty", 400));
  }

  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    upiReference,
    couponCode,
  } = req.body;
  const paymentMethod = req.body.paymentMethod;

  const shippingAddress = {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
  };
  const missing = REQUIRED_ADDRESS_FIELDS.filter(
    (field) => !shippingAddress[field] || !String(shippingAddress[field]).trim()
  );
  if (missing.length > 0) {
    return next(
      new ErrorHandler(
        `Missing required address fields: ${missing.join(", ")}`,
        400
      )
    );
  }

  if (!["COD", "Online"].includes(paymentMethod)) {
    return next(
      new ErrorHandler("Payment method must be either COD or Online", 400)
    );
  }

  // Re-validate and deduct stock to prevent overselling
  for (const item of cart.items) {
    if (!item.part) {
      return res.sendError(
        "A product in your cart is no longer available",
        400
      );
    }
    const part = await Part.findById(item.part._id);
    if (!part) {
      return res.sendError(
        `Product ${item.name || "Item"} is no longer available`,
        400
      );
    }
    if (part.stock < item.quantity) {
      return res.sendError(`Insufficient stock for ${part.name}`, 400);
    }
  }

  // All checks passed, deduct stock atomically

  // The stock decrements and the order write share one transaction, so a
  // failure anywhere after the decrement rolls the stock back automatically.
  // Previously this was a manual compensating unwind driven by `updatedParts`,
  // which could not survive a process crash between the deduction and the
  // rollback loop.
  const stockSession = await mongoose.startSession();
  stockSession.startTransaction();

  try {
    // One round trip for the whole cart instead of one per item.
    //
    // The `stock: { $gte: quantity }` filter is what makes each decrement safe
    // against a concurrent order taking the same stock, and bulkWrite keeps that
    // guard per operation — batching changes the number of round trips, not the
    // concurrency guarantee.
    //
    // `ordered: false` lets the driver run them in parallel. Ordering is
    // irrelevant here: every operation targets a distinct part and carries its
    // own guard.
    const stockOps = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.part._id, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const bulkResult = await Part.bulkWrite(stockOps, {
      ordered: false,
      session: stockSession,
    });

    // A filter matching nothing means someone else took the stock between the
    // pre-check above and this write.
    //
    // bulkWrite reports only a count — it cannot say *which* operation missed —
    // so there is no way to compensate for a partial application by hand. That
    // is why this runs inside a transaction: aborting rolls back whichever
    // decrements did apply, atomically, and the manual `updatedParts` unwind
    // that used to be necessary is gone.
    if (bulkResult.modifiedCount !== cart.items.length) {
      throw new ErrorHandler(
        "Insufficient stock for one or more items in your cart. " +
          "Please review your cart and try again.",
        400
      );
    }

    // Snapshot the cart items onto the order (unit price + image), so the order
    // record stays correct even if a part is later edited or removed.
    const items = cart.items.map((item) => {
      const unitPrice =
        item.part && typeof item.part.price === "number"
          ? item.part.price
          : item.quantity > 0
          ? item.price / item.quantity
          : item.price;
      const image =
        item.part && item.part.images && item.part.images.length > 0
          ? item.part.images[0].url
          : "";
      return {
        part: item.part ? item.part._id : undefined,
        name: item.name || (item.part ? item.part.name : "Item"),
        price: unitPrice,
        quantity: item.quantity,
        image,
      };
    });

    // Derive the total from the snapshot itself so the receipt's line totals
    // always sum to the grand total, regardless of any stale cart.total value.
    const itemsTotal = items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    // Re-validate the coupon (if any) server-side — never trust client discount amount.
    let appliedCouponCode = "";
    let discount = 0;
    if (couponCode && String(couponCode).trim()) {
      const coupon = await Coupon.findOne({
        code: String(couponCode).trim().toUpperCase(),
      });
      if (!coupon) {
        throw new ErrorHandler("Invalid coupon code", 400);
      }
      const redeemable = coupon.isRedeemable();
      if (!redeemable.ok) {
        throw new ErrorHandler(redeemable.reason, 400);
      }
      const computed = coupon.computeDiscount(itemsTotal);
      if (computed <= 0) {
        throw new ErrorHandler("This coupon does not apply to your order", 400);
      }
      const claim = await Coupon.findOneAndUpdate(
        {
          _id: coupon._id,
          isActive: true,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
          $and: [
            {
              $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
            },
            {
              $or: [
                { usageLimit: 0 },
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
              ],
            },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true, session: stockSession }
      );
      if (!claim) {
        throw new ErrorHandler(
          "This coupon is no longer valid or has reached its usage limit",
          400
        );
      }
      appliedCouponCode = coupon.code;
      discount = computed;
    }

    const grandTotal = Math.max(0, itemsTotal - discount);

    let paymentScreenshot = { public_id: "", url: "" };
    let paymentStatus;
    let orderStatus;
    let clientSecret = null;

    if (paymentMethod === "Online") {
      paymentStatus = "Pending";
      orderStatus = "Pending Verification";
    } else {
      // COD
      paymentStatus = "Pending";
      orderStatus = "Confirmed";
    }

    // Array form: Model.create() only accepts options as a second argument when
    // the documents are passed as an array.
    const [order] = await Order.create([{
      user: req.user._id,
      items,
      shippingAddress,
      itemsTotal,
      couponCode: appliedCouponCode,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      orderStatus,
      paymentScreenshot,
      upiReference: upiReference || "",
      statusHistory: [{ status: orderStatus, changedAt: new Date() }],
    }], { session: stockSession });

    if (paymentMethod === "Online") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(grandTotal * 100), // amount in paise/cents
        currency: "inr",
        metadata: {
          orderId: order._id.toString(),
        },
      });
      clientSecret = paymentIntent.client_secret;
    }

    // Link the order to the user's history WITHOUT calling user.save(), which
    // would trigger the model's pre-save hook and re-hash the password.
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orderHistory: order._id } },
      { session: stockSession }
    );

    // Clear the cart now that it has been converted into an order.
    cart.items = [];
    cart.total = 0;
    await cart.save({ session: stockSession });

    // Fire-and-forget email; a failure here must never break order creation.
    try {
      if (paymentMethod === "COD") {
        await sendEmail({
          sendTo: req.user.email,
          subject: `Order Confirmed - ${order._id}`,
          html: orderReceiptHtml(order, req.user),
        });
      } else {
        await sendEmail({
          sendTo: req.user.email,
          subject: `Order Received - Pending Payment Verification`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#111827;">Thank you for your order!</h2>
          <p style="color:#555;">We have received your order <strong>${
            order._id
          }</strong>.</p>
          <p style="color:#555;">Please complete your payment. You will receive a confirmation email with your receipt once it is approved.</p>
          ${
            discount > 0
              ? `<p style="color:#555;">Subtotal: Rs. ${Number(
                  itemsTotal
                ).toLocaleString("en-IN")}</p>
          <p style="color:#16a34a;">Discount (${appliedCouponCode}): -Rs. ${Number(
                  discount
                ).toLocaleString("en-IN")}</p>`
              : ""
          }
          <p style="color:#555;">Order total: <strong>Rs. ${Number(
            grandTotal
          ).toLocaleString("en-IN")}</strong></p>
        </div>`,
        });
      }
    } catch (mailErr) {
      console.error("Order email failed:", mailErr.message);
    }

    // Notify store admins of the new order (best-effort, gated by the admin
    // settings toggle) via the shared notifyAdmins helper. It runs isolated and
    // never throws, so it cannot trigger the stock-rollback below.
    await notifyAdmins({
      preferenceKey: "notifyAdminsOnNewOrder",
      subject:
        paymentMethod === "Online"
          ? `New Order (Payment Verification Needed) - ${order._id}`
          : `New Order Received - ${order._id}`,
      html: generateAdminNewOrderEmail(order, req.user),
    });

    // Commit before responding: the client must not be told the order succeeded
    // until the stock decrement and the order document are both durable.
    await stockSession.commitTransaction();

    res.sendSuccess({
      message:
        paymentMethod === "COD"
          ? "Order placed successfully"
          : "Order placed. Payment is pending.",
      order,
      clientSecret,
    });
  } catch (error) {
    // The transaction unwinds every stock decrement, so no manual compensation
    // is needed. Guarded because commitTransaction() may already have run and a
    // second abort would throw over the original error.
    if (stockSession.inTransaction()) {
      await stockSession.abortTransaction();
    }

    return next(error);
  } finally {
    stockSession.endSession();
  }
});

// GET /api/orders/my-orders  (auth)
export const getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.sendSuccess({ count: orders.length, orders });
});

// GET /api/orders/:id  (auth, owner only)
export const getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to view this order", 403));
  }
  res.sendSuccess({ order });
});

// A customer may cancel their own order only while it is still in an early,
// reversible state. Once it is Processing / Shipped / Delivered it has entered
// fulfilment and can no longer be self-cancelled.
const CUSTOMER_CANCELLABLE_STATUSES = ["Pending Verification", "Confirmed"];

// PUT /api/orders/:id/cancel  (auth, owner only)
// Customer-initiated cancellation. Verifies ownership, enforces status-based
// eligibility, restores stock using the same guarded pattern as the admin
// reject/cancel paths, and emails the customer a cancellation confirmation.
export const cancelMyOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  // Ownership: a customer can only cancel an order that belongs to them.
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to cancel this order", 403));
  }

  if (order.orderStatus === "Cancelled") {
    return next(new ErrorHandler("This order is already cancelled", 400));
  }

  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    return next(
      new ErrorHandler(
        `This order is ${
          order.orderStatus
        } and can no longer be cancelled. Orders can only be cancelled while they are ${CUSTOMER_CANCELLABLE_STATUSES.join(
          " or "
        )}. Please contact support for assistance.`,
        400
      )
    );
  }

  order.orderStatus = "Cancelled";
  order.rejectionReason = "Cancelled by customer";
  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({ status: "Cancelled", changedAt: new Date() });

  // Restore stock once, guarded by stockRestored — identical to the restore
  // used by adminVerifyPayment (reject) and adminUpdateOrderStatus (Cancelled).
  if (!order.stockRestored) {
    for (const item of order.items) {
      if (item.part) {
        await Part.findByIdAndUpdate(item.part, {
          $inc: { stock: item.quantity },
        });
      }
    }
    order.stockRestored = true;
  }

  await order.save();

  // Best-effort confirmation email — a mail failure must not fail the request.
  try {
    const itemsHtml = order.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> &times; ${item.quantity}</li>`
      )
      .join("");
    await sendEmail({
      sendTo: req.user.email,
      subject: `Order Cancelled - Order ${order._id}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#e91e63;">Order Cancellation Confirmation</h2>
        <p style="color:#555;">Dear ${req.user.name || "Customer"},</p>
        <p style="color:#555;">Your order <strong>${
          order._id
        }</strong> has been cancelled as requested.</p>
        <ul style="color:#555;">${itemsHtml}</ul>
        <p style="color:#555;">Any reserved stock has been released. If your payment was already completed, our team will process the refund as per policy.</p>
        <p style="color:#555;">If you did not request this cancellation, please contact our support team immediately.</p>
        <p style="color:#555;">Best regards,<br/>Samridhi Enterprises</p>
      </div>`,
    });
  } catch (mailErr) {
    console.error("Cancellation email failed:", mailErr.message);
  }

  res.sendSuccess({
    message: "Order cancelled successfully",
    order,
  });
});

// GET /api/orders/admin/all?status=...  (auth, admin)
export const adminGetAllOrders = catchAsyncErrors(async (req, res, next) => {
  const filter = {};
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.sendSuccess({ count: orders.length, orders });
});

// PUT /api/orders/admin/verify/:id  (auth, admin)  body: { action, rejectionReason }
export const adminVerifyPayment = catchAsyncErrors(async (req, res, next) => {
  const { action, rejectionReason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return next(
      new ErrorHandler("Action must be either 'approve' or 'reject'", 400)
    );
  }

  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (order.orderStatus === "Cancelled" || order.paymentStatus === "Failed") {
    return next(
      new ErrorHandler("Order is already cancelled or payment rejected", 400)
    );
  }

  if (action === "approve") {
    order.paymentStatus = "Success";
    order.orderStatus = "Confirmed";
    order.verifiedAt = new Date();
    order.rejectionReason = "";
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({ status: "Confirmed", changedAt: new Date() });
    await order.save();

    try {
      await sendEmail({
        sendTo: order.user?.email,
        subject: `Payment Verified - Receipt for Order ${order._id}`,
        html: orderReceiptHtml(order, order.user),
      });
    } catch (mailErr) {
      console.error("Receipt email failed:", mailErr.message);
    }

    return res.sendSuccess({
      message: "Payment approved and order confirmed",
      order,
    });
  }

  // reject
  order.paymentStatus = "Failed";
  order.orderStatus = "Cancelled";
  order.rejectionReason = rejectionReason || "Payment could not be verified";
  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({ status: "Cancelled", changedAt: new Date() });

  // Restore stock if not already restored
  if (!order.stockRestored) {
    for (const item of order.items) {
      if (item.part) {
        await Part.findByIdAndUpdate(item.part, {
          $inc: { stock: item.quantity },
        });
      }
    }
    order.stockRestored = true;
  }
  await order.save();

  try {
    await sendEmail({
      sendTo: order.user?.email,
      subject: `Payment Verification Failed - Order ${order._id}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#b91c1c;">Payment Verification Failed</h2>
        <p style="color:#555;">Unfortunately we could not verify the payment for your order <strong>${order._id}</strong>.</p>
        <p style="color:#555;"><strong>Reason:</strong> ${order.rejectionReason}</p>
        <p style="color:#555;">If you believe this is a mistake, please contact our support team.</p>
      </div>`,
    });
  } catch (mailErr) {
    console.error("Rejection email failed:", mailErr.message);
  }

  res.sendSuccess({
    message: "Payment rejected and order cancelled",
    order,
  });
});

// PUT /api/orders/admin/status/:id  (auth, admin)  body: { orderStatus }
// Advances an order through its fulfilment lifecycle (Confirmed -> Processing
// -> Shipped -> Delivered, or Cancelled). Payment verification is handled
// separately by adminVerifyPayment; this endpoint is purely operational and
// only accepts the post-confirmation statuses so a pending-verification order
// cannot be pushed straight to Shipped without its payment being approved.
const FULFILLMENT_STATUSES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const VALID_TRANSITIONS = {
  "Pending Verification": ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export const adminUpdateOrderStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { orderStatus, status, carrier, trackingNumber } = req.body;
    const targetStatus = orderStatus || status;

    if (!targetStatus || !FULFILLMENT_STATUSES.includes(targetStatus)) {
      return next(
        new ErrorHandler(
          `orderStatus must be one of: ${FULFILLMENT_STATUSES.join(", ")}`,
          400
        )
      );
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    const currentStatus = order.orderStatus;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (targetStatus !== currentStatus && !allowed.includes(targetStatus)) {
      return next(
        new ErrorHandler(
          `Invalid status transition from ${currentStatus} to ${targetStatus}. Allowed transitions: ${
            allowed.join(", ") || "none"
          }`,
          400
        )
      );
    }

    // Guard: an order whose payment has not succeeded should not be marked as
    // physically fulfilled. It can still be Cancelled.
    if (
      order.paymentStatus !== "Success" &&
      ["Processing", "Shipped", "Delivered"].includes(targetStatus)
    ) {
      return next(
        new ErrorHandler(
          "Cannot advance fulfilment until the order's payment is verified",
          400
        )
      );
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = targetStatus;

    if (carrier !== undefined) order.carrier = carrier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    if (!order.statusHistory) order.statusHistory = [];
    if (previousStatus !== targetStatus || order.statusHistory.length === 0) {
      order.statusHistory.push({ status: targetStatus, changedAt: new Date() });
    }

    if (targetStatus === "Cancelled" && !order.stockRestored) {
      // Restore stock
      for (const item of order.items) {
        if (item.part) {
          await Part.findByIdAndUpdate(item.part, {
            $inc: { stock: item.quantity },
          });
        }
      }
      order.stockRestored = true;
    }
    await order.save();

    if (carrier || trackingNumber || targetStatus === "Shipped") {
      try {
        await sendEmail({
          sendTo: order.user?.email,
          subject: `Shipment Update for Order #${order._id}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#111827;">Order Shipment Update</h2>
            <p style="color:#555;">Dear ${order.user?.name || "Customer"},</p>
            <p style="color:#555;">Your order <strong>${
              order._id
            }</strong> status is now: <strong>${order.orderStatus}</strong>.</p>
            ${
              order.carrier
                ? `<p style="color:#555;"><strong>Carrier:</strong> ${order.carrier}</p>`
                : ""
            }
            ${
              order.trackingNumber
                ? `<p style="color:#555;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
                : ""
            }
            <p style="color:#555;">Thank you for shopping with Samridhi Enterprises!</p>
          </div>`,
        });
      } catch (mailErr) {
        console.error("Shipment email failed:", mailErr.message);
      }
    }

    res.sendSuccess({
      message: `Order status updated to ${targetStatus}`,
      order,
    });
  }
);

// Added for #352: Subscription Auto Reordering endpoints
import Subscription from "../models/subscriptionModel.js";
export const createPartSubscription = catchAsyncErrors(
  async (req, res, next) => {
    const { partId, frequency } = req.body;
    const nextOrderDate = new Date();
    if (frequency === "weekly")
      nextOrderDate.setDate(nextOrderDate.getDate() + 7);
    else if (frequency === "monthly")
      nextOrderDate.setMonth(nextOrderDate.getMonth() + 1);

    const subscription = await Subscription.create({
      user: req.user._id,
      part: partId,
      frequency,
      nextOrderDate,
    });

    res.sendSuccess({ subscription }, 201);
  }
);
