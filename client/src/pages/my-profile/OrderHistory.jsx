import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import {
  getMyOrders,
  cancelMyOrder,
  clearOrderError,
} from "../../store/order/orderSlice";
import Loader from "../../extras/Loader";
import ConfirmationModal from "../../extras/ConfirmationModal";
import { generateOrderInvoicePDF } from "../../utils/invoicePDFGenerator.js";

// The fulfilment stages a normal order moves through, in order. Used by the
// customer-facing tracker so a buyer can see how far along their order is.
const TRACKER_STAGES = ["Confirmed", "Processing", "Shipped", "Delivered"];

// Statuses in which a customer may still cancel their own order. Mirrors the
// server-side eligibility in cancelMyOrder so the button only appears when the
// action will actually be accepted.
const CUSTOMER_CANCELLABLE = ["Pending Verification", "Confirmed"];

// Horizontal step tracker showing an order's progress through its lifecycle.
// Cancelled / Pending-Verification orders skip the tracker (handled by the
// caller) since they are not on the normal Confirmed->Delivered path.
const OrderTracker = ({ orderStatus }) => {
  const currentIndex = TRACKER_STAGES.indexOf(orderStatus);

  return (
    <div className="flex items-center w-full my-4" aria-label="Order progress">
      {TRACKER_STAGES.map((stage, i) => {
        const reached = i <= currentIndex;
        const isLast = i === TRACKER_STAGES.length - 1;
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  reached
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400 dark:text-gray-500"
                }`}
              >
                {reached ? "✓" : i + 1}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium ${
                  reached ? "text-blue-700 dark:text-blue-300" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {stage}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  i < currentIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const statusColor = (status) => {
  switch (status) {
    case "Success":
    case "Confirmed":
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Pending":
    case "Pending Verification":
    case "Processing":
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    case "Failed":
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100";
  }
};

const formatDate = (d) =>
  new Date(d).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const generateReceiptPDF = (order, user) => {
  const doc = new jsPDF();
  const left = 15;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Samridhi Enterprises", 105, y, { align: "center" });
  y += 7;
  doc.setFontSize(11);
  doc.text("Order Receipt", 105, y, { align: "center" });
  y += 6;
  doc.setLineWidth(0.4);
  doc.line(left, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`Receipt No: ${order._id}`, left, y);
  y += 6;
  doc.text(`Date: ${formatDate(order.createdAt)}`, left, y);
  y += 6;
  doc.text(
    `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
    left,
    y
  );
  y += 6;
  doc.text(`Order Status: ${order.orderStatus}`, left, y);
  if (order.upiReference) {
    y += 6;
    doc.text(`UPI Reference: ${order.upiReference}`, left, y);
  }
  y += 10;

  const addr = order.shippingAddress || {};
  doc.setFont(undefined, "bold");
  doc.text("Billed / Shipped To:", left, y);
  doc.setFont(undefined, "normal");
  y += 6;
  doc.text(`${addr.fullName || user?.name || ""}`, left, y);
  y += 6;
  if (user?.email) {
    doc.text(`${user.email}`, left, y);
    y += 6;
  }
  doc.text(`${addr.addressLine || ""}`, left, y);
  y += 6;
  doc.text(
    `${addr.city || ""}${addr.state ? ", " + addr.state : ""} - ${
      addr.pincode || ""
    }`,
    left,
    y
  );
  y += 6;
  doc.text(`Phone: ${addr.phone || ""}`, left, y);
  y += 10;

  // Items table header
  doc.setFont(undefined, "bold");
  doc.text("Item", left, y);
  doc.text("Qty", 120, y);
  doc.text("Unit (Rs.)", 140, y);
  doc.text("Total (Rs.)", 172, y);
  doc.setFont(undefined, "normal");
  y += 3;
  doc.line(left, y, 195, y);
  y += 6;

  (order.items || []).forEach((item) => {
    const name =
      item.name.length > 40 ? item.name.slice(0, 37) + "..." : item.name;
    const lineTotal = item.price * item.quantity;
    doc.text(name, left, y);
    doc.text(String(item.quantity), 122, y, { align: "center" });
    doc.text(Number(item.price).toLocaleString("en-IN"), 150, y, {
      align: "right",
    });
    doc.text(Number(lineTotal).toLocaleString("en-IN"), 188, y, {
      align: "right",
    });
    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 2;
  doc.line(left, y, 195, y);
  y += 8;
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", 140, y);
  doc.text(
    "Rs. " + Number(order.itemsTotal).toLocaleString("en-IN"),
    188,
    y,
    { align: "right" }
  );
  doc.setFont(undefined, "normal");

  y += 14;
  doc.setFontSize(9);
  doc.text(
    "Thank you for shopping with Samridhi Enterprises.",
    105,
    y,
    { align: "center" }
  );

  doc.save(`receipt-${order._id}.pdf`);
};

const getTrackingUrl = (carrier, trackingNumber) => {
  if (!trackingNumber) return null;
  const c = (carrier || "").toLowerCase();
  if (c.includes("blue dart")) return `https://www.bluedart.com/tracking?trackNumber=${trackingNumber}`;
  if (c.includes("dtdc")) return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${trackingNumber}`;
  if (c.includes("india post")) return `https://www.indiapost.gov.in/`;
  return `https://www.google.com/search?q=${encodeURIComponent((carrier || "") + " tracking " + trackingNumber)}`;
};

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  // The order awaiting cancel confirmation (null = dialog closed), and the id
  // of the order currently being cancelled (to disable its button in flight).
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    const id = cancelTarget._id;
    setCancelTarget(null);
    setCancellingId(id);
    dispatch(cancelMyOrder(id))
      .unwrap()
      .then(() => toast.success("Order cancelled successfully"))
      .catch(() => {}) // errors surface via the error effect below
      .finally(() => setCancellingId(null));
  };

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const htmlStr = await response.text();
      const win = window.open("", "_blank");
      win.document.write(htmlStr);
      win.document.close();
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) return <Loader />;

  if (!myOrders || myOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No orders yet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your placed orders will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-10">
          My Orders
        </h1>

        <div className="space-y-6">
          {myOrders.map((order) => {
            const canDownload =
              order.orderStatus !== "Cancelled" &&
              order.orderStatus !== "Pending Verification";
            const canCancel = CUSTOMER_CANCELLABLE.includes(order.orderStatus);
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Order ID</p>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-200 break-all">
                      {order._id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Customer order tracker — only for orders on the normal
                    fulfilment path. Cancelled and not-yet-confirmed orders
                    don't show a progress bar. */}
                {order.orderStatus !== "Cancelled" &&
                  order.orderStatus !== "Pending Verification" && (
                    <OrderTracker orderStatus={order.orderStatus} />
                  )}

                {/* Shipment & Tracking Details */}
                {(order.carrier || order.trackingNumber) && (
                  <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl p-4 my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-blue-100 dark:border-blue-900">
                    <div>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                        Shipment Tracking
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {order.carrier && <span className="font-semibold">{order.carrier}: </span>}
                        <span className="font-mono">{order.trackingNumber || "N/A"}</span>
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <a
                        href={getTrackingUrl(order.carrier, order.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow transition"
                      >
                        Track Shipment ↗
                      </a>
                    )}
                  </div>
                )}

                {/* Status History Timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="my-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Status History Timeline
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {order.statusHistory.map((sh, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span className="font-medium">• {sh.status}</span>
                          <span className="text-gray-400">{formatDate(sh.changedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={item._id || item.part || `${order._id}-${idx}`}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-200 pr-2">
                        {item.name}{" "}
                        <span className="text-gray-400 dark:text-gray-500">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {order.rejectionReason && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
                    Rejection reason: {order.rejectionReason}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Total: ₹{order.itemsTotal.toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {canCancel && (
                      <button
                        onClick={() => setCancelTarget(order)}
                        disabled={cancellingId === order._id}
                        className="px-5 py-2.5 rounded-xl border border-red-500 text-red-600 font-semibold text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Cancel this order"
                      >
                        {cancellingId === order._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadInvoice(order._id)}
                      disabled={!canDownload}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold text-sm shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title={
                        canDownload
                          ? "Download HTML Invoice"
                          : "Invoice available after order is confirmed"
                      }
                    >
                      Download Invoice
                    </button>
                    <button
                      onClick={() => generateReceiptPDF(order, user)}
                      disabled={!canDownload}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title={
                        canDownload
                          ? "Download receipt"
                          : "Receipt available after the order is confirmed"
                      }
                    >
                      Download Receipt
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <ConfirmationModal
          isOpen={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel this order?"
          message={
            cancelTarget
              ? `Order ${cancelTarget._id} will be cancelled and any reserved stock released. This action cannot be undone. If you have already paid, our team will process your refund as per policy.`
              : ""
          }
        />
      </div>
    </div>
  );
};

export default OrderHistory;
