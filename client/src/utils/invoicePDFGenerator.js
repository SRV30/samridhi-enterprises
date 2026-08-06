import { jsPDF } from "jspdf";

/**
 * Generate formatted tax invoice PDF documents for completed customer orders.
 */
export const generateOrderInvoicePDF = (order) => {
  const doc = new jsPDF();

  // Header / Branding
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38); // Primary red accent
  doc.text("SAMRIDHI ENTERPRISES", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Genuine Spare Parts & Accessories", 14, 26);
  doc.text("GSTIN: 19ABCDE1234F1ZH | Email: support@samridhienterprises.com", 14, 31);

  // Line separator
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  // Invoice Meta details
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("TAX INVOICE", 14, 44);

  doc.setFontSize(10);
  doc.text(`Order ID: #${order._id || order.id}`, 14, 52);
  doc.text(`Invoice Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 14, 58);
  doc.text(`Payment Status: ${order.paymentStatus || "Paid"}`, 14, 64);
  doc.text(`Payment Method: ${order.paymentMethod || "Online"}`, 14, 70);

  // Shipping Address Box
  doc.rect(120, 40, 76, 34);
  doc.setFontSize(10);
  doc.text("Billed & Shipped To:", 124, 46);
  doc.setFontSize(9);
  const addr = order.shippingAddress || {};
  doc.text(`${addr.fullName || "Customer"}`, 124, 52);
  doc.text(`${addr.addressLine || addr.street || ""}`, 124, 57);
  doc.text(`${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`, 124, 62);
  doc.text(`Phone: ${addr.phone || "N/A"}`, 124, 67);

  // Items Table Header
  let startY = 82;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, startY, 182, 8, "F");

  doc.setFontSize(10);
  doc.text("Item Description", 18, startY + 6);
  doc.text("Qty", 120, startY + 6);
  doc.text("Unit Price", 145, startY + 6);
  doc.text("Total", 175, startY + 6);

  // Table Body
  startY += 12;
  const items = order.items || order.orderItems || [];
  let subtotal = 0;

  items.forEach((item) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    subtotal += itemTotal;

    const itemName = item.name || item.partId?.name || "Spare Part";
    doc.setFontSize(9);
    doc.text(itemName.substring(0, 45), 18, startY);
    doc.text(String(item.quantity || 1), 122, startY);
    doc.text(`₹${(item.price || 0).toLocaleString()}`, 145, startY);
    doc.text(`₹${itemTotal.toLocaleString()}`, 175, startY);

    startY += 7;
  });

  doc.line(14, startY + 2, 196, startY + 2);
  startY += 8;

  // Summary Totals
  const discount = order.discountAmount || order.discount || 0;
  const grandTotal = order.totalAmount || Math.max(0, subtotal - discount);

  doc.setFontSize(10);
  doc.text(`Subtotal: ₹${subtotal.toLocaleString()}`, 140, startY);
  startY += 6;

  if (discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`Discount: -₹${discount.toLocaleString()}`, 140, startY);
    doc.setTextColor(0);
    startY += 6;
  }

  doc.setFontSize(11);
  doc.text(`Grand Total: ₹${grandTotal.toLocaleString()}`, 140, startY);

  // Footer Note
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Thank you for shopping with Samridhi Enterprises! This is a computer-generated invoice.", 14, 280);

  // Trigger Download
  doc.save(`Invoice_${order._id || "Order"}.pdf`);
};
