import express from "express";
import rateLimit from "express-rate-limit";
import upload from "../middleware/multer.js";
import validateUploadedImages from "../middleware/validateUploadedImages.js";
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

const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const recommendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const partRouter = express.Router();
import { bulkUpdateStock } from "../controllers/partsControllers.js";

partRouter.get("/admin/low-stock", auth, admin, getLowStockParts);
partRouter.put("/admin/bulk-stock", auth, admin, bulkUpdateStock);
// Authenticate and authorize before parsing multipart bodies into memory.
partRouter.post("/add", auth, admin, upload.array("images", 5), validateUploadedImages, addPart);
partRouter.get("/get", browseLimiter, getAllParts);
partRouter.get("/get/:id", browseLimiter, getPartById);
partRouter.get("/get/:id/similar", browseLimiter, getSimilarParts);
partRouter.get("/get/:id/frequently-bought-together", browseLimiter, getFrequentlyBoughtTogether);
partRouter.get("/recommendations/for-you", recommendLimiter, auth, getRecommendedForYou);
partRouter.post("/recommendations/track-impressions", browseLimiter, trackRecommendationImpressions);
partRouter.post("/recommendations/track-click", browseLimiter, trackRecommendationClick);
partRouter.get("/admin/recommendation-analytics", recommendLimiter, auth, admin, adminGetRecommendationAnalytics);
partRouter.put("/update/:id", auth, admin, upload.array("images", 5), validateUploadedImages, updatePart);
partRouter.delete("/delete/:id", auth, admin, deletePart);
partRouter.post("/review/:id", auth, createOrUpdateReview);
partRouter.delete("/review/:id", auth, deleteReview);

export default partRouter;