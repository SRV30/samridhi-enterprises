import express from "express";
import upload from "../middleware/multer.js";
import validateUploadedImages from "../middleware/validateUploadedImages.js";
import {
  addBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";

const brandRouter = express.Router();

brandRouter.post("/add", auth, admin, upload.single("image"), validateUploadedImages, addBrand);
brandRouter.get("/get", getAllBrands);
brandRouter.put("/update/:id", auth, admin, upload.single("image"), validateUploadedImages, updateBrand);
brandRouter.delete("/delete/:id", auth, admin, deleteBrand);

export default brandRouter;
