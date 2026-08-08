import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1, "Please enter a subject"),
  message: z.string().trim().min(1, "Please describe your issue"),
  category: z.enum(["Order", "Payment", "Product", "Shipping", "Account", "Other"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

export const addMessageSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty"),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});
