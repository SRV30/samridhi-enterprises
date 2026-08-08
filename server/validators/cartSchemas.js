import { z } from "zod";

export const addToCartSchema = z.object({
  partId: z.string().trim().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be a positive integer"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be a positive integer"),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      partId: z.string().trim().min(1, "Part ID is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })
  ),
});
