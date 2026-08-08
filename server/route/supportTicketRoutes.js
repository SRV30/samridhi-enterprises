import express from "express";
import {
  createTicket,
  getMyTickets,
  getMyTicket,
  addMessage,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  adminReply,
} from "../controllers/supportTicketController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import validateSchema from "../middleware/validateSchema.js";
import {
  createTicketSchema,
  addMessageSchema,
  updateTicketStatusSchema,
} from "../validators/supportSchemas.js";

const supportTicketRouter = express.Router();

// ── Authenticated user routes ──
supportTicketRouter.post("/create", auth, validateSchema(createTicketSchema), createTicket);
supportTicketRouter.get("/my", auth, getMyTickets);
supportTicketRouter.get("/my/:id", auth, getMyTicket);
supportTicketRouter.post("/my/:id/message", auth, validateSchema(addMessageSchema), addMessage);

// ── Admin routes ──
supportTicketRouter.get("/admin/get", auth, admin, getAllTickets);
supportTicketRouter.get("/admin/:id", auth, admin, getTicketById);
supportTicketRouter.put("/admin/:id/status", auth, admin, validateSchema(updateTicketStatusSchema), updateTicketStatus);
supportTicketRouter.post("/admin/:id/reply", auth, admin, validateSchema(addMessageSchema), adminReply);

export default supportTicketRouter;
