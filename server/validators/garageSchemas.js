import { z } from "zod";

export const addVehicleSchema = z.object({
  bikeModel: z.string().trim().min(1, "Bike model is required"),
  year: z.union([z.number().int().min(1900).max(2100), z.string().trim().min(1)]),
  variant: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

export const updateVehicleSchema = addVehicleSchema.partial();
