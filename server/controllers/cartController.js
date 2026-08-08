import Cart from "../models/cartModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

/*
  NOTE: getCart recalculates in-memory only and avoids unnecessary DB writes.
*/



const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      total: 0,
    });
  }
  return cart;
};

const addItemToCart = async (cart, partId, quantity) => {
  const part = await Part.findById(partId);
  if (!part) {
    throw new ErrorHandler("Part not found", 404);
  }
  if (part.stock < quantity) {
    throw new ErrorHandler("Insufficient stock", 400);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.part.toString() === partId
  );
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].price = part.price * cart.items[itemIndex].quantity;
  } else {
    cart.items.push({
      part: partId,
      quantity,
      price: part.price * quantity,
      name: part.name,
    });
  }

  return cart;
};

export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { partId, quantity } = req.body;
  const userId = req.user._id;
  const cart = await getOrCreateCart(userId);

  await addItemToCart(cart, partId, quantity);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  res.sendSuccess({ cart });
});

export const syncCart = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const cart = await getOrCreateCart(userId);
  const failedItems = [];

  for (const item of items) {
    const partId = item.partId;
    const quantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(partId) || !Number.isInteger(quantity) || quantity < 1) {
      failedItems.push({
        partId,
        quantity: item.quantity,
        reason: "Invalid cart item",
      });
      continue;
    }

    try {
      await addItemToCart(cart, partId, quantity);
    } catch (error) {
      failedItems.push({
        partId,
        quantity,
        reason: error.message || "Unable to sync item",
      });
    }
  }

  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  const syncedCart = await Cart.findOne({ user: userId }).populate(
    "items.part",
    "name price images stock"
  );

  res.sendSuccess({
    warnings: failedItems.map((item) => `Could not sync item ${item.partId}: ${item.reason}`),
    failedItems,
    cart: syncedCart,
  });
});

const recalculateCart = ({ populatedItems }) => {
  // Returns in-memory adjusted items + warnings and a boolean indicating
  // whether we must persist changes to DB.
  const warnings = [];
  const adjustedItems = [];

  let removedItems = false;
  let quantityChangedAny = false;
  let priceChangedAny = false;

  for (const item of populatedItems) {
    const part = item.part;

    // Underlying part was deleted/unpopulated.
    if (part === null || part === undefined) {
      removedItems = true;
      continue;
    }

    // Stock-out -> remove from cart.
    if (part.stock <= 0) {
      removedItems = true;
      warnings.push(`${part.name} is out of stock and has been removed from your cart.`);
      continue;
    }

    const requestedQty = item.quantity;
    const currentUnitPrice = part.price;

    let finalQty = requestedQty;
    if (part.stock < requestedQty) {
      finalQty = part.stock;
      quantityChangedAny = true;
      warnings.push(`Quantity for ${part.name} has been adjusted to ${part.stock} due to limited stock.`);
    }

    // Compare stored unit price (based on stored total / quantity) with current unit price.
    const storedUnitPrice =
      requestedQty > 0 ? item.price / requestedQty : currentUnitPrice;

    const storedPaise = Math.round(storedUnitPrice * 100);
    const currentPaise = Math.round(currentUnitPrice * 100);

    if (storedPaise !== currentPaise) {
      priceChangedAny = true;
      warnings.push(
        `Price for ${part.name} has changed from ₹${storedUnitPrice.toLocaleString("en-IN")} to ₹${currentUnitPrice.toLocaleString("en-IN")}.`
      );
    }

    // Only mutate if needed.
    const expectedPrice = currentUnitPrice * finalQty;
    if (finalQty !== requestedQty || expectedPrice !== item.price) {
      item.quantity = finalQty;
      item.price = expectedPrice;
    }

    adjustedItems.push(item);
  }

  const recomputedTotal = adjustedItems.reduce((sum, i) => sum + i.price, 0);
  const needsSave = removedItems || quantityChangedAny || priceChangedAny;

  return { warnings, adjustedItems, recomputedTotal, needsSave };
};


export const getCart = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.part",
    "name price images stock"
  );

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      total: 0,
    });
    return res.sendSuccess({ warnings: [], cart });
  }

  const populatedItems = Array.isArray(cart.items) ? cart.items : [];
  const {
    warnings,
    adjustedItems,
    recomputedTotal,
    needsSave,
  } = recalculateCart({ populatedItems });

  // Apply in-memory changes regardless; we persist only if necessary.
  cart.items = adjustedItems;
  cart.total = recomputedTotal;

  if (needsSave) {
    await cart.save();
  }

  return res.sendSuccess({ warnings, cart });
});


export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { quantity } = req.body;
  const partId = req.params.partId;

  // Quantity must be a whole number of at least 1. Without this guard a direct
  // API call could send 0, a negative (which makes price negative), or a
  // fractional quantity. The client clamps too, but the endpoint must validate.
  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new ErrorHandler("Quantity must be a whole number of at least 1", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const itemIndex = cart.items.findIndex(
    (item) => item.part.toString() === partId
  );
  if (itemIndex < 0)
    return next(new ErrorHandler("Item not found in cart", 404));

  const part = await Part.findById(partId);
  if (!part) return next(new ErrorHandler("Product not found", 404));
  if (part.stock < quantity)
    return next(new ErrorHandler("Insufficient stock", 400));

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = part.price * quantity;
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.sendSuccess({ cart });
});

export const removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { partId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  cart.items = cart.items.filter((item) => item.part.toString() !== partId);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.sendSuccess({ cart });
});


export const clearCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  console.log('Before clearing cart:', JSON.stringify(cart, null, 2));
  cart.items = [];
  cart.total = 0;

  await cart.save();
  const clearedCart = await Cart.findOne({ user: req.user._id }).populate("items.part", "name price images stock");
  console.log('Cleared cart:', JSON.stringify(clearedCart, null, 2));
  res.sendSuccess({ cart: clearedCart });
});

import { purgeAbandonedCarts } from "../utils/staleCartCleaner.js";

export const cleanupStaleCarts = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const result = await purgeAbandonedCarts(days);

  res.sendSuccess({
    message: `Successfully purged abandoned carts inactive for over ${days} days.`,
    ...result,
  });
});

