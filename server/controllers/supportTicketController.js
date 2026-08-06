import SupportTicket from "../models/supportTicketModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import notifyAdmins from "../utils/adminNotifier.js";
import generateAdminNewTicketEmail from "../template/adminNewTicketTemplate.js";

const VALID_CATEGORIES = [
  "Order",
  "Payment",
  "Product",
  "Shipping",
  "Account",
  "Other",
];
const VALID_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

// ── User: create a ticket ─────────────────────────────────────────────────
// The opening description becomes the first message in the thread.
import { TicketPriorityCalculator } from "../utils/ticketPriorityCalculator.js";

export const createTicket = catchAsyncErrors(async (req, res, next) => {
  const { subject, category, priority, message } = req.body;

  if (!subject || !String(subject).trim()) {
    return next(new ErrorHandler("Please enter a subject", 400));
  }
  if (!message || !String(message).trim()) {
    return next(new ErrorHandler("Please describe your issue", 400));
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return next(new ErrorHandler("Invalid category", 400));
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return next(new ErrorHandler("Invalid priority", 400));
  }

  const effectivePriority =
    priority ||
    TicketPriorityCalculator.calculateSuggestedPriority(
      category || "Other",
      subject,
      message
    );

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject: String(subject).trim(),
    category: category || "Other",
    priority: effectivePriority,
    messages: [
      {
        sender: "USER",
        senderName: req.user.name || "Customer",
        body: String(message).trim(),
      },
    ],
    lastActivityAt: new Date(),
  });

  // Notify store admins of the new ticket (best-effort, gated by the admin
  // settings toggle). notifyAdmins never throws, so a mail failure here can
  // never break ticket creation.
  await notifyAdmins({
    preferenceKey: "notifyAdminsOnNewTicket",
    subject:
      ticket.priority === "High"
        ? `New Support Ticket (High Priority) - ${ticket.subject}`
        : `New Support Ticket - ${ticket.subject}`,
    html: generateAdminNewTicketEmail(ticket, req.user),
  });

  res.sendSuccess({ ticket }, 201);
});

// ── User: list own tickets ────────────────────────────────────────────────
export const getMyTickets = catchAsyncErrors(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({
    lastActivityAt: -1,
  });
  res.sendSuccess({ tickets });
});

// ── User: get a single own ticket (with full thread) ──────────────────────
export const getMyTicket = catchAsyncErrors(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));

  // Ownership guard: a user may only read their own tickets.
  if (ticket.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to view this ticket", 403));
  }

  res.sendSuccess({ ticket });
});

// ── User: add a message to own ticket ─────────────────────────────────────
export const addMessage = catchAsyncErrors(async (req, res, next) => {
  const { body } = req.body;
  if (!body || !String(body).trim()) {
    return next(new ErrorHandler("Message cannot be empty", 400));
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));

  if (ticket.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to reply to this ticket", 403));
  }
  if (ticket.status === "Closed") {
    return next(
      new ErrorHandler("This ticket is closed. Please open a new one.", 400)
    );
  }

  ticket.messages.push({
    sender: "USER",
    senderName: req.user.name || "Customer",
    body: String(body).trim(),
  });
  // A customer reply re-opens a resolved ticket so admins notice the follow-up.
  if (ticket.status === "Resolved") ticket.status = "Open";
  ticket.lastActivityAt = new Date();
  await ticket.save();

  res.sendSuccess({ ticket });
});

// ── Admin: list all tickets (optional status/category filter) ─────────────
export const getAllTickets = catchAsyncErrors(async (req, res) => {
  const filter = {};
  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
    filter.category = req.query.category;
  }

  const tickets = await SupportTicket.find(filter)
    .populate("user", "name email")
    .sort({ lastActivityAt: -1 });

  res.sendSuccess({ tickets });
});

// ── Admin: get a single ticket (with full thread) ─────────────────────────
export const getTicketById = catchAsyncErrors(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));
  res.sendSuccess({ ticket });
});

// ── Admin: update ticket status ───────────────────────────────────────────
export const updateTicketStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));

  ticket.status = status;
  ticket.lastActivityAt = new Date();
  await ticket.save();

  const populated = await ticket.populate("user", "name email");
  res.sendSuccess({ ticket: populated });
});

// ── Admin: reply to a ticket ──────────────────────────────────────────────
export const checkAndEscalateSLA = catchAsyncErrors(async (req, res, next) => {
  const tickets = await SupportTicket.find({ status: { $in: ["Open", "In Progress"] }, priority: { $ne: "High" } });
  let escalatedCount = 0;

  for (const ticket of tickets) {
    if (TicketPriorityCalculator.shouldEscalatePriority(ticket, 24)) {
      ticket.priority = "High";
      await ticket.save();
      escalatedCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: `SLA escalation evaluation completed. ${escalatedCount} ticket(s) escalated to High priority.`,
    escalatedCount,
  });
});

export const adminReply = catchAsyncErrors(async (req, res, next) => {
  const { body } = req.body;
  if (!body || !String(body).trim()) {
    return next(new ErrorHandler("Message cannot be empty", 400));
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return next(new ErrorHandler("Ticket not found", 404));

  ticket.messages.push({
    sender: "ADMIN",
    senderName: "Support Team",
    body: String(body).trim(),
  });
  // An admin reply on a brand-new ticket moves it into the active queue.
  if (ticket.status === "Open") ticket.status = "In Progress";
  ticket.lastActivityAt = new Date();
  await ticket.save();

  const populated = await ticket.populate("user", "name email");
  res.sendSuccess({ ticket: populated });
});
