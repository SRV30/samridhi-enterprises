import { z } from "zod";

export const addAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  addressLine: z.string().trim().min(1, "Address line is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  pincode: z.string().trim().min(1, "Pincode is required"),
  label: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addAddressSchema.partial();
