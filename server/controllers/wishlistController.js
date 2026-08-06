import Wishlist from "../models/wishlistModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

const PART_FIELDS = "name price images stock product_id category";

// Re-fetch the user's wishlist with part details populated and any dangling
// (deleted-part) entries filtered out, so every response has an identical
// shape and the client can always rely on item.part._id.
const populatedWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.part",
    PART_FIELDS
  );
  if (!wishlist) return { user: userId, items: [] };
  const before = wishlist.items.length;
  wishlist.items = wishlist.items.filter((i) => i.part != null);
  if (wishlist.items.length !== before) await wishlist.save();
  return wishlist;
};

// GET /api/wishlist  (auth)
export const getWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await populatedWishlist(req.user._id);
  res.sendSuccess({ wishlist });
});

// POST /api/wishlist  (auth)  body: { partId }
export const addToWishlist = catchAsyncErrors(async (req, res, next) => {
  const { partId } = req.body;
  if (!partId) return next(new ErrorHandler("partId is required", 400));

  const part = await Part.findById(partId);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  // No duplicates — adding an item already present is a no-op.
  const exists = wishlist.items.some((i) => i.part.toString() === partId);
  if (!exists) {
    wishlist.items.push({ part: partId });
    await wishlist.save();
  }

  const populated = await populatedWishlist(req.user._id);
  res.sendSuccess({ wishlist: populated });
});

// DELETE /api/wishlist/:partId  (auth)
export const removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const { partId } = req.params;
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return next(new ErrorHandler("Wishlist not found", 404));

  wishlist.items = wishlist.items.filter((i) => i.part.toString() !== partId);
  await wishlist.save();

  const populated = await populatedWishlist(req.user._id);
  res.sendSuccess({ wishlist: populated });
});
