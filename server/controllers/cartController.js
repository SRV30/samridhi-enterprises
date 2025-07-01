import Cart from "../models/cartModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { partId, quantity } = req.body;
  const userId = req.user._id;

  const part = await Part.findById(partId);
  if (!part) return next(new ErrorHandler("Part not found", 404));
  if (part.stock < quantity)
    return next(new ErrorHandler("Insufficient stock", 400));

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      total: 0,
    });
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

  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  await cart.save();

  res.status(200).json({ success: true, cart });
});

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
  } else {
    cart.items = cart.items.filter(
      (item) => item.part !== null && item.part !== undefined
    );
    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
    await cart.save();
  }
  res.status(200).json({ success: true, cart });
});

export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { quantity } = req.body;
  const partId = req.params.partId;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  const itemIndex = cart.items.findIndex(
    (item) => item.part.toString() === partId
  );
  if (itemIndex < 0)
    return next(new ErrorHandler("Item not found in cart", 404));

  const part = await Part.findById(partId);
  if (part.stock < quantity)
    return next(new ErrorHandler("Insufficient stock", 400));

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = part.price * quantity;
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
});

export const removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { partId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  cart.items = cart.items.filter((item) => item.part.toString() !== partId);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

  await cart.save();
  res.status(200).json({ success: true, cart });
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
  res.status(200).json({ success: true, cart: clearedCart });
});