import User from "../models/userModel.js";
import PaymentSettings from "../models/paymentSettingsModel.js";
import sendEmail from "../config/sendEmail.js";

// Reusable admin-notification helper.
//
// Resolves the store's admin recipients (role ADMIN / MANAGER) from the
// database — never a hardcoded address — and emails each of them a templated
// message for a critical system event (new order, new support ticket, etc).
//
// This generalizes the order-specific block that previously lived inline in
// createOrder, so every event type shares one recipient-resolution + send path
// instead of duplicating it.
//
// Behaviour:
//   - Gated by a per-event preference flag on the single PaymentSettings doc
//     (e.g. notifyAdminsOnNewOrder, notifyAdminsOnNewTicket). When the flag is
//     missing it defaults to ON, so a brand-new event type notifies by default
//     and an admin can opt out from settings.
//   - Best-effort and fully isolated: any failure (no settings, no admins, mail
//     error) is caught and logged, and the function resolves to false. It never
//     throws, so a notification failure can never break the underlying
//     operation that triggered it (order creation, ticket creation, etc).
//
// @param {Object}  params
// @param {string}  params.preferenceKey  PaymentSettings boolean field gating
//                                         this event (default ON if absent).
// @param {string}  params.subject        Email subject line.
// @param {string}  params.html           Rendered HTML email body.
// @returns {Promise<boolean>}            true if at least one email was sent,
//                                         false otherwise (never throws).
const notifyAdmins = async ({ preferenceKey, subject, html }) => {
  try {
    if (!subject || !html) return false;

    // Preference gate. A missing flag means "not explicitly disabled" -> notify.
    if (preferenceKey) {
      const settings = await PaymentSettings.findOne();
      const enabled = settings ? settings[preferenceKey] !== false : true;
      if (!enabled) return false;
    }

    const admins = await User.find({
      role: { $in: ["ADMIN", "MANAGER"] },
    }).select("email name");

    if (!admins.length) return false;

    let sentAny = false;
    for (const admin of admins) {
      if (admin.email) {
        await sendEmail({ sendTo: admin.email, subject, html });
        sentAny = true;
      }
    }
    return sentAny;
  } catch (err) {
    console.error("Admin notification failed:", err.message);
    return false;
  }
};

export default notifyAdmins;

// Added helper for low stock alert
export const notifyAdminsOnLowStock = async (parts) => {
  return notifyAdmins({
    preferenceKey: "notifyAdminsOnLowStock",
    subject: "Alert: Low Stock Items Detected",
    html: `<h1>Low Stock Report</h1><p>${parts.length} parts are currently low on stock.</p>`
  });
};
