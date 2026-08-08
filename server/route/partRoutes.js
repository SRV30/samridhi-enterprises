import express from "express";
import rateLimit from "express-rate-limit";
import upload from "../middleware/multer.js";
import {
  getLowStockParts,
  addPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  createOrUpdateReview,
  deleteReview,
  getSimilarParts,
  getFrequentlyBoughtTogether,
  getRecommendedForYou,
  trackRecommendationImpressions,
  trackRecommendationClick,
  adminGetRecommendationAnalytics,
} from "../controllers/partsControllers.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";

// Rate limiter for public catalogue-browsing endpoints (no auth required).
// Allows generous traffic for real shoppers while guarding against scrapers
// and incidental abuse that would hammer the database.
const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Slightly tighter limiter for the personalized recommendations endpoint,
// which runs several database lookups (cart + wishlist + orders) per call.
const recommendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const partRouter = express.Router();

import { bulkUpdateStock } from "../controllers/partsControllers.js";

partRouter.get("/admin/low-stock", auth, admin, getLowStockParts);
partRouter.put("/admin/bulk-stock", auth, admin, bulkUpdateStock);
partRouter.post("/add", upload.array("images", 5), auth, admin, addPart);
// partRouter.post("/warehouse-stock/:id", auth, admin, addWarehouseStock);
partRouter.get("/get", browseLimiter, getAllParts);
// partRouter.get("/search/faceted", browseLimiter, getFacetedSearchResults);
partRouter.get("/get/:id", browseLimiter, getPartById);
partRouter.get("/get/:id/similar", browseLimiter, getSimilarParts);
partRouter.get(
  "/get/:id/frequently-bought-together",
  browseLimiter,
  getFrequentlyBoughtTogether
);
partRouter.get(
  "/recommendations/for-you",
  recommendLimiter,
  auth,
  getRecommendedForYou
);

// Recommendation analytics tracking (lightweight counter bumps).
partRouter.post(
  "/recommendations/track-impressions",
  browseLimiter,
  trackRecommendationImpressions
);
partRouter.post(
  "/recommendations/track-click",
  browseLimiter,
  trackRecommendationClick
);

// Admin — recommendation & engagement analytics dashboard data.
partRouter.get(
  "/admin/recommendation-analytics",
  recommendLimiter,
  auth,
  admin,
  adminGetRecommendationAnalytics
);
partRouter.put(
  "/update/:id",
  upload.array("images", 5),
  auth,
  admin,
  updatePart
);
partRouter.delete("/delete/:id", auth, admin, deletePart);
partRouter.post("/review/:id", auth, createOrUpdateReview);
partRouter.delete("/review/:id", auth, deleteReview);

export default partRouter;
