import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";
import auth from "../middleware/auth.js";
import validateSchema from "../middleware/validateSchema.js";
import { addToCartSchema, updateCartItemSchema, syncCartSchema } from "../validators/cartSchemas.js";

const cartRouter = express.Router();

cartRouter.post("/add", auth, validateSchema(addToCartSchema), addToCart);
cartRouter.post("/sync", auth, validateSchema(syncCartSchema), syncCart);
cartRouter.get("/get", auth, getCart);
cartRouter.put("/update/:partId", auth, validateSchema(updateCartItemSchema), updateCartItem);
cartRouter.delete("/remove/:partId", auth, removeFromCart);
cartRouter.delete("/clear", auth, clearCart);

import admin from "../middleware/Admin.js";
import { cleanupStaleCarts } from "../controllers/cartController.js";

cartRouter.delete("/admin/cleanup", auth, admin, cleanupStaleCarts);

export default cartRouter;
