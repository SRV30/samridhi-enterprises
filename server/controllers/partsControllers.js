import Part from "../models/partModel.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Wishlist from "../models/wishlistModel.js";
import BikeModel from "../models/bikeModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { logAudit } from "../utils/auditLogger.js";

// Create a new part
export const addPart = catchAsyncErrors(async (req, res, next) => {
  const {
    product_id,
    name,
    description,
    price,
    stock,
    vehicleCompatibility,
    category,
    bestseller,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("At least one image is required", 400));
  }

  const images = [];
  for (const file of req.files) {
    const upload = await uploadImage(file);
    if (!upload?.secure_url) {
      return next(new ErrorHandler("Image upload failed", 500));
    }
    images.push({ public_id: upload.public_id, url: upload.secure_url });
  }

  const part = await Part.create({
    product_id,
    name,
    description,
    price,
    stock,
    category,
    vehicleCompatibility: vehicleCompatibility || [],
    images,
    bestseller: bestseller === "true" || bestseller === true,
  });

  res.sendSuccess({ part }, 201);
});

// Get all parts
export const getAllParts = catchAsyncErrors(async (req, res) => {
  const { vehicleId, page, limit } = req.query;

  const filter = { isDeleted: false };

  if (vehicleId) {
    filter.vehicleCompatibility = vehicleId;
  }

  const total = await Part.countDocuments(filter);

  const isPaginated = page !== undefined || limit !== undefined;
  const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  const limitNum =
    limit !== undefined
      ? Math.max(1, parseInt(limit, 10) || 10)
      : isPaginated
      ? 10
      : total || 10;
  const skip = (pageNum - 1) * limitNum;

  const parts = await Part.find(filter)
    .populate("vehicleCompatibility", "name")
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum) || 1;
  const hasNextPage = pageNum < totalPages;
  const hasPreviousPage = pageNum > 1;

  res.sendSuccess({
    count: parts.length,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    parts,
  });
});

// Get single part
export const getPartById = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate("vehicleCompatibility", "name");

  if (!part) return next(new ErrorHandler("Part not found", 404));

  // Count this as a product view for analytics. Fire-and-forget: a failed
  // counter update must never break the actual product response.
  Part.updateOne({ _id: part._id }, { $inc: { viewCount: 1 } }).catch(() => {});

  res.sendSuccess({ part });
});

// Update part
export const updatePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findOne({ _id: req.params.id, isDeleted: false });
  if (!part) return next(new ErrorHandler("Part not found", 404));

  const fieldsToUpdate = [
    "product_id",
    "name",
    "description",
    "price",
    "stock",
    "category",
    "vehicleCompatibility",
    "bestseller",
  ];
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      part[field] =
        field === "bestseller"
          ? req.body[field] === "true" || req.body[field] === true
          : req.body[field];
    }
  });

  if (req.files && req.files.length > 0) {
    // Delete existing images
    for (const img of part.images) {
      await deleteImage(img.public_id);
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const upload = await uploadImage(file);
      if (!upload?.secure_url) {
        return next(new ErrorHandler("Image upload failed", 500));
      }
      images.push({ public_id: upload.public_id, url: upload.secure_url });
    }
    part.images = images;
  }

  await part.save();

  // Audit trail.
  logAudit({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "PART_UPDATE",
    entityType: "Part",
    entityId: part._id.toString(),
    metadata: { updatedFields: fieldsToUpdate },
  }).catch(() => {});

  res.sendSuccess({ message: "Part updated", part });
});

// Delete part
export const deletePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part || part.isDeleted)
    return next(new ErrorHandler("Part not found", 404));

  for (const img of part.images) {
    await deleteImage(img.public_id);
  }

  // Soft delete (preserve history for orders/analytics/reviews)
  part.isDeleted = true;
  part.deletedAt = new Date();
  await part.save();

  // Audit trail.
  logAudit({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "PART_DELETE",
    entityType: "Part",
    entityId: part._id.toString(),
    metadata: {},
  }).catch(() => {});

  res.sendSuccess({ message: "Part soft-deleted" });
});

// Add or update review
export const createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  const part = await Part.findOne({ _id: req.params.id, isDeleted: false });

  if (!part) return next(new ErrorHandler("Part not found", 404));

  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.part": part._id,
    orderStatus: "Delivered",
  });
  const verifiedPurchase = Boolean(hasPurchased);

  const existingReviewIndex = part.reviews.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReviewIndex !== -1) {
    part.reviews[existingReviewIndex].comment = comment;
    part.reviews[existingReviewIndex].rating = Number(rating);
    part.reviews[existingReviewIndex].verifiedPurchase = verifiedPurchase;
  } else {
    part.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      verifiedPurchase,
    });
  }

  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.sendSuccess({ message: "Review submitted", part });
});

// Get similar / recommended parts for a given part.
// Recommends other products based on: same category, shared vehicle
// compatibility (i.e. fits the same bikes/brands), and a similar price range.
// The current product is always excluded and results are capped (default 6).
export const getSimilarParts = catchAsyncErrors(async (req, res, next) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);

  const current = await Part.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!current) return next(new ErrorHandler("Part not found", 404));

  const compatibilityIds = (current.vehicleCompatibility || []).map((v) =>
    v.toString()
  );

  // Candidate pool: other parts that share the category OR at least one
  // compatible vehicle. This keeps the query scoped instead of scanning the
  // whole catalogue, while still covering both signals used for scoring.
  const orConditions = [{ category: current.category }];
  if (compatibilityIds.length > 0) {
    orConditions.push({
      vehicleCompatibility: { $in: current.vehicleCompatibility },
    });
  }

  const candidates = await Part.find({
    _id: { $ne: current._id },
    $or: orConditions,
  })
    .populate("vehicleCompatibility", "name")
    .select(
      "product_id name price stock category images ratings numOfReviews bestseller vehicleCompatibility"
    );

  // Score each candidate by how closely it matches the current product.
  const price = current.price || 0;
  const scored = candidates.map((part) => {
    let score = 0;

    // Same category is the strongest signal.
    if (part.category === current.category) score += 3;

    // Shared compatible vehicles (same fitment / brand). Capped so a part that
    // fits many vehicles can't dominate purely on overlap count.
    if (compatibilityIds.length > 0) {
      const shared = (part.vehicleCompatibility || []).filter(
        (v) => v && v._id && compatibilityIds.includes(v._id.toString())
      ).length;
      score += Math.min(shared, 3) * 2;
    }

    // Similar price range relative to the current product.
    if (price > 0) {
      const diff = Math.abs(part.price - price) / price;
      if (diff <= 0.2) score += 2;
      else if (diff <= 0.4) score += 1;
    }

    return { part, score };
  });

  // Highest score first; break ties by rating, then by review count.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if ((b.part.ratings || 0) !== (a.part.ratings || 0))
      return (b.part.ratings || 0) - (a.part.ratings || 0);
    return (b.part.numOfReviews || 0) - (a.part.numOfReviews || 0);
  });

  const parts = scored.slice(0, limit).map((s) => s.part);

  res.sendSuccess({ count: parts.length, parts });
});

// Get "Frequently Bought Together" products for a given part.
//
// Looks at real purchase history: every non-cancelled order that contains the
// target part, then counts how often each *other* part appears alongside it
// across those orders. Products that co-occur most often are the strongest
// "bought together" signal. Cancelled orders are excluded so abandoned/voided
// purchases don't pollute the signal. The target part itself is always removed
// from the results, deleted/missing parts are filtered out, and results are
// capped (default 6).
//
// When there isn't enough purchase history to produce co-occurrence results
// (a new catalogue, or a product no one has bought with anything yet), the
// endpoint falls back to same-category products so the section still shows
// something relevant instead of being empty.
export const getFrequentlyBoughtTogether = catchAsyncErrors(
  async (req, res, next) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);

    const targetId = req.params.id;
    const current = await Part.findOne({ _id: targetId, isDeleted: false });
    if (!current) return next(new ErrorHandler("Part not found", 404));

    // All non-cancelled orders that include the target part.
    const orders = await Order.find({
      orderStatus: { $ne: "Cancelled" },
      "items.part": targetId,
    }).select("items.part");

    // Tally co-occurrence counts for every other part.
    const counts = new Map();
    for (const order of orders) {
      // Unique part ids in this order (a part bought twice in one order should
      // still only count once toward "bought together").
      const ids = new Set(
        (order.items || [])
          .map((i) => i.part && i.part.toString())
          .filter(Boolean)
      );
      if (!ids.has(targetId.toString())) continue;
      for (const id of ids) {
        if (id === targetId.toString()) continue;
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }

    // Rank co-occurring part ids by frequency (highest first).
    const rankedIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    let parts = [];
    if (rankedIds.length > 0) {
      const found = await Part.find({
        _id: { $in: rankedIds },
        isDeleted: false,
      }).select(
        "product_id name price stock category images ratings numOfReviews bestseller"
      );

      // Preserve the co-occurrence ranking order (Mongo doesn't guarantee it).
      const byId = new Map(found.map((p) => [p._id.toString(), p]));
      parts = rankedIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .slice(0, limit);
    }

    // Fallback: not enough purchase history -> same-category products.
    if (parts.length === 0) {
      parts = await Part.find({
        _id: { $ne: current._id },
        category: current.category,
        isDeleted: false,
      })

        .select(
          "product_id name price stock category images ratings numOfReviews bestseller"
        )
        .sort({ bestseller: -1, ratings: -1, numOfReviews: -1 })
        .limit(limit);
    }

    res.sendSuccess({
      count: parts.length,
      parts,
      basedOn: rankedIds.length > 0 ? "purchase-history" : "category-fallback",
    });
  }
);

// Get personalized "Recommended For You" products for the logged-in user.
//
// Builds a lightweight taste profile from the user's own activity — the
// categories of the parts in their cart, their wishlist, and their past
// (non-cancelled) orders. Categories the user engages with more often are
// weighted higher (a category that shows up across cart + wishlist + orders
// outranks one seen once). We then recommend the best products (bestseller,
// then rating, then review count) from those preferred categories, excluding
// anything the user already has in cart / wishlist / past orders so we surface
// genuinely new suggestions.
//
// Fallbacks keep the section useful for everyone:
//   - A brand-new user with no cart / wishlist / orders gets top catalogue
//     products (bestseller + highest rated).
//   - If the preferred-category pool is too small, we top up with general
//     best products so the row is never sparse.
//
// Requires auth (the route is mounted behind the auth middleware) so req.user
// is always present.
export const getRecommendedForYou = catchAsyncErrors(async (req, res, next) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
  const userId = req.user._id;

  // Gather the user's signal parts from cart, wishlist, and past orders.
  const [cart, wishlist, orders] = await Promise.all([
    Cart.findOne({ user: userId }).select("items.part"),
    Wishlist.findOne({ user: userId }).select("items.part"),
    Order.find({ user: userId, orderStatus: { $ne: "Cancelled" } }).select(
      "items.part"
    ),
  ]);

  // Collect the ids of parts the user already has (to exclude from results)
  // and use as the signal for category preference.
  const ownedIds = new Set();

  const addPart = (partRef) => {
    if (!partRef) return;
    ownedIds.add(partRef.toString());
  };

  (cart?.items || []).forEach((i) => addPart(i.part));
  (wishlist?.items || []).forEach((i) => addPart(i.part));
  (orders || []).forEach((o) =>
    (o.items || []).forEach((i) => addPart(i.part))
  );

  // Resolve the signal parts to learn their categories and weight them.
  const categoryWeights = new Map();
  if (ownedIds.size > 0) {
    const signalParts = await Part.find({
      _id: { $in: [...ownedIds] },
    }).select("category");
    for (const p of signalParts) {
      if (p.category) {
        categoryWeights.set(
          p.category,
          (categoryWeights.get(p.category) || 0) + 1
        );
      }
    }
  }

  const preferredCategories = [...categoryWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const ownedArray = [...ownedIds];
  let parts = [];

  // Primary: best products from the user's preferred categories, excluding
  // what they already have.
  if (preferredCategories.length > 0) {
    parts = await Part.find({
      _id: { $nin: ownedArray },
      category: { $in: preferredCategories },
      isDeleted: false,
    })

      .select(
        "product_id name price stock category images ratings numOfReviews bestseller"
      )
      .sort({ bestseller: -1, ratings: -1, numOfReviews: -1 })
      .limit(limit);
  }

  // Top up (or full fallback for new users) with general best products.
  if (parts.length < limit) {
    const excludeIds = [
      ...new Set([...ownedArray, ...parts.map((p) => p._id.toString())]),
    ];
    const filler = await Part.find({
      _id: { $nin: excludeIds },
      isDeleted: false,
    })

      .select(
        "product_id name price stock category images ratings numOfReviews bestseller"
      )
      .sort({ bestseller: -1, ratings: -1, numOfReviews: -1 })
      .limit(limit - parts.length);
    parts = parts.concat(filler);
  }

  res.sendSuccess({
    count: parts.length,
    parts,
    personalized: preferredCategories.length > 0,
  });
});

// Track recommendation impressions — called by the frontend when a set of
// recommended products is actually shown to a user in a recommendation row.
// Accepts an array of part IDs and bulk-increments their impression counters.
// Validates IDs, caps the batch size, and never throws on bad input so the
// tracking call can't disrupt the page.
export const trackRecommendationImpressions = catchAsyncErrors(
  async (req, res) => {
    const ids = Array.isArray(req.body?.productIds) ? req.body.productIds : [];

    // Keep only well-formed, unique ObjectIds and cap the batch to a sane size.
    const validIds = [
      ...new Set(
        ids.filter(
          (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)
        )
      ),
    ].slice(0, 50);

    if (validIds.length > 0) {
      await Part.updateMany(
        { _id: { $in: validIds } },
        { $inc: { recommendationImpressions: 1 } }
      );
    }

    res.sendSuccess({ tracked: validIds.length });
  }
);

// Track a recommendation click — called when a user clicks through to a
// product from a recommendation row. Increments that product's click counter.
export const trackRecommendationClick = catchAsyncErrors(async (req, res) => {
  const { productId } = req.body || {};

  if (typeof productId === "string" && /^[a-fA-F0-9]{24}$/.test(productId)) {
    await Part.updateOne(
      { _id: productId },
      { $inc: { recommendationClicks: 1 } }
    );
    return res.sendSuccess({ tracked: true });
  }

  res.sendSuccess({ tracked: false });
});

// Admin — recommendation & engagement analytics.
// Surfaces three things the issue asks for:
//   - Most viewed products (by viewCount)
//   - Most recommended products (by recommendationImpressions)
//   - Recommendation CTR (clicks / impressions), both overall and per product
// All computed from the lightweight counters on the Part model.
export const adminGetRecommendationAnalytics = catchAsyncErrors(
  async (req, res) => {
    // Admin/Manager dashboards should not show soft-deleted parts.

    const LIMIT = 8;

    const [mostViewed, mostRecommended, totalsAgg] = await Promise.all([
      // Most viewed products (exclude soft-deleted).
      Part.find({ viewCount: { $gt: 0 }, isDeleted: false })

        .sort({ viewCount: -1 })
        .limit(LIMIT)
        .select("name category viewCount images"),

      // Most recommended products (most impressions in recommendation rows),
      // with per-product CTR included (exclude soft-deleted).
      Part.find({ recommendationImpressions: { $gt: 0 }, isDeleted: false })

        .sort({ recommendationImpressions: -1 })
        .limit(LIMIT)
        .select(
          "name category recommendationImpressions recommendationClicks images"
        ),

      // Catalogue-wide impression / click totals for the overall CTR figure.
      Part.aggregate([
        {
          $group: {
            _id: null,
            totalImpressions: { $sum: "$recommendationImpressions" },
            totalClicks: { $sum: "$recommendationClicks" },
            totalViews: { $sum: "$viewCount" },
          },
        },
      ]),
    ]);

    const totals = totalsAgg[0] || {
      totalImpressions: 0,
      totalClicks: 0,
      totalViews: 0,
    };

    const overallCtr =
      totals.totalImpressions > 0
        ? totals.totalClicks / totals.totalImpressions
        : 0;

    const mostViewedOut = mostViewed.map((p) => ({
      _id: p._id,
      name: p.name || "Unknown product",
      category: p.category,
      viewCount: p.viewCount || 0,
      image: p.images?.[0]?.url || "",
    }));

    const mostRecommendedOut = mostRecommended.map((p) => {
      const impressions = p.recommendationImpressions || 0;
      const clicks = p.recommendationClicks || 0;
      return {
        _id: p._id,
        name: p.name || "Unknown product",
        category: p.category,
        impressions,
        clicks,
        ctr: impressions > 0 ? clicks / impressions : 0,
        image: p.images?.[0]?.url || "",
      };
    });

    res.sendSuccess({
      recommendationAnalytics: {
        mostViewed: mostViewedOut,
        mostRecommended: mostRecommendedOut,
        totals: {
          totalViews: totals.totalViews || 0,
          totalImpressions: totals.totalImpressions || 0,
          totalClicks: totals.totalClicks || 0,
          overallCtr,
        },
      },
    });
  }
);

// Delete review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findOne({ _id: req.params.id, isDeleted: false });

  if (!part) return next(new ErrorHandler("Part not found", 404));

  part.reviews = part.reviews.filter(
    (r) => r.user.toString() !== req.user._id.toString()
  );

  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.sendSuccess({ message: "Review removed", part });
});

import {
  buildDynamicSearchFilters,
  getSidebarFacets,
} from "../utils/dynamicSearchAggregator.js";

export const getFacetedSearchResults = catchAsyncErrors(
  async (req, res, next) => {
    const filter = buildDynamicSearchFilters(req.query);
    const parts = await Part.find(filter);
    const facets = await getSidebarFacets();

    res.sendSuccess({
      count: parts.length,
      parts,
      facets,
    });
  }
);

// Added for #341: Get low stock parts for administrators
export const getLowStockParts = catchAsyncErrors(async (req, res, next) => {
  const parts = await Part.find({
    isDeleted: false,
    $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
  });
  res.sendSuccess({ count: parts.length, parts });
});

// Bulk update inventory stock with atomic safety
import { processBulkStockAdjustment } from "../utils/bulkInventoryManager.js";
import { runInTransaction } from "../utils/transactionSessionManager.js";

export const bulkUpdateStock = catchAsyncErrors(async (req, res, next) => {
  const { updates } = req.body;

  const result = await runInTransaction(async (session) => {
    return await processBulkStockAdjustment(updates, req.user, session);
  });

  res.sendSuccess({
    message: "Bulk inventory stock updated successfully",
    updatedItemsCount: result.length,
    details: result,
  });
});
