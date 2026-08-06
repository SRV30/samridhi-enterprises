import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    phone: z.string().trim().min(1, "Phone is required"),
    addressLine: z.string().trim().min(1, "Address line is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().optional(),
    pincode: z.string().trim().min(1, "Pincode is required"),
  }),
  paymentMethod: z.enum(["COD", "Online"], {
    errorMap: () => ({ message: "Payment method must be COD or Online" }),
  }),
  couponCode: z.string().trim().optional(),
});

export const verifyPaymentSchema = z.object({
  action: z.enum(["approve", "reject"], {
    errorMap: () => ({ message: "Action must be either approve or reject" }),
  }),
  rejectionReason: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]).optional(),
  status: z.enum(["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]).optional(),
  carrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
});
