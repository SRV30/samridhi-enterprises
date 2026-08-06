import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Snapshot of the cart at the time of ordering, so the order is unaffected
    // by later changes to (or deletion of) the underlying parts.
    items: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: "Part" },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }, // unit price
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      pincode: { type: String, required: true },
    },
    itemsTotal: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: "" },
    isReordered: { type: Boolean, default: false },
    discount: { type: Number, default: 0, min: 0 },
    // grandTotal = itemsTotal − discount. Not required so that admin
    // operations calling .save() on pre-coupon orders do not fail
    // Mongoose validation. New orders always receive this from createOrder.
    grandTotal: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Pending Verification", "Success", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending Verification",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Confirmed",
    },
    // Customer-uploaded UPI payment proof (Online payments only).
    paymentScreenshot: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    upiReference: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    stockRestored: { type: Boolean, default: false },
    carrier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for the common queries: a user's own orders (newest first) and the
// admin order list filtered by status.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
