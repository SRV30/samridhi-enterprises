import ErrorHandler from "../utils/errorHandler.js";
import PaymentSettings from "../models/paymentSettingsModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// GET /api/payment-settings  (auth)
// Returns the store's UPI details for the checkout page. Safe defaults are
// returned when the admin has not configured anything yet.
export const getPaymentSettings = catchAsyncErrors(async (req, res, next) => {
  const settings = await PaymentSettings.findOne();
  res.sendSuccess({
    settings: settings || {
      upiId: "",
      qrImage: { public_id: "", url: "" },
      notifyAdminsOnNewOrder: true,
      notifyAdminsOnNewTicket: true,
    },
  });
});

// PUT /api/payment-settings/admin/update  (auth, admin, multipart: optional "qrImage")
// Creates or updates the single PaymentSettings document.
export const adminUpdatePaymentSettings = catchAsyncErrors(
  async (req, res, next) => {
    const { upiId } = req.body;

    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings();
    }

    if (typeof upiId === "string") {
      settings.upiId = upiId.trim();
    }

    // Multipart form values arrive as strings ("true" / "false").
    if (typeof req.body.notifyAdminsOnNewOrder !== "undefined") {
      settings.notifyAdminsOnNewOrder =
        req.body.notifyAdminsOnNewOrder === true ||
        req.body.notifyAdminsOnNewOrder === "true";
    }

    if (typeof req.body.notifyAdminsOnNewTicket !== "undefined") {
      settings.notifyAdminsOnNewTicket =
        req.body.notifyAdminsOnNewTicket === true ||
        req.body.notifyAdminsOnNewTicket === "true";
    }

    if (req.file) {
      const uploaded = await uploadImage(req.file);
      if (!uploaded || !uploaded.secure_url) {
        return next(new ErrorHandler("QR image upload failed. Please try again.", 500));
      }
      // Remove the previous QR from Cloudinary if one existed.
      if (settings.qrImage && settings.qrImage.public_id) {
        try {
          await deleteImage(settings.qrImage.public_id);
        } catch (delErr) {
          console.error("Old QR delete failed:", delErr.message);
        }
      }
      settings.qrImage = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };
    }

    await settings.save();

    res.sendSuccess({
      message: "Payment settings updated successfully",
      settings,
    });
  }
);
