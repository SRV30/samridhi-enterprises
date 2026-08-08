import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Part from "../models/partModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendEmail from "../config/sendEmail.js";
import orderReceiptHtml from "../template/orderReceiptTemplate.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const order = await Order.findById(orderId).populate("user", "name email");
        if (order && order.paymentStatus !== "Success") {
          order.paymentStatus = "Success";
          order.orderStatus = "Confirmed";
          order.verifiedAt = new Date();
          order.rejectionReason = "";
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
        }
      }
      break;
    }
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const order = await Order.findById(orderId).populate("user", "name email");
        if (order && order.paymentStatus !== "Success" && order.orderStatus !== "Cancelled") {
          order.paymentStatus = "Failed";
          order.orderStatus = "Cancelled";
          order.rejectionReason = "Payment failed or was canceled during checkout.";

          // Restore stock
          if (!order.stockRestored) {
            for (const item of order.items) {
              if (item.part) {
                await Part.findByIdAndUpdate(item.part, { $inc: { stock: item.quantity } });
              }
            }
            order.stockRestored = true;
          }
          await order.save();

          try {
            await sendEmail({
              sendTo: order.user?.email,
              subject: `Payment Failed - Order ${order._id}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#b91c1c;">Payment Failed</h2>
                <p style="color:#555;">Unfortunately, the payment for your order <strong>${order._id}</strong> failed.</p>
                <p style="color:#555;">The order has been cancelled and any reserved stock has been released. Please try placing the order again.</p>
              </div>`,
            });
          } catch (mailErr) {
            console.error("Rejection email failed:", mailErr.message);
          }
        }
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});
