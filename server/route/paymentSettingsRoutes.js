import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import upload from "../middleware/multer.js";
import validateUploadedImages from "../middleware/validateUploadedImages.js";
import {
  getPaymentSettings,
  adminUpdatePaymentSettings,
} from "../controllers/paymentSettingsController.js";

const paymentSettingsRouter = express.Router();

paymentSettingsRouter.get("/", auth, getPaymentSettings);
paymentSettingsRouter.put(
  "/admin/update",
  auth,
  admin,
  upload.single("qrImage"),
  validateUploadedImages,
  adminUpdatePaymentSettings
);

export default paymentSettingsRouter;
