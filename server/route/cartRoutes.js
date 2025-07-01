import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import auth from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.route("/").post(auth, addToCart).get(auth, getCart);
cartRouter
  .route("/:partId")
  .put(auth, updateCartItem)
  .delete(auth, removeFromCart);
cartRouter.route("/clear").delete(auth, clearCart);

export default cartRouter;
