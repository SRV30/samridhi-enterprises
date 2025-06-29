import express from "express";
import upload from "../middleware/multer.js";
import {
  addBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";

const brandRouter = express.Router();

brandRouter.post("/add", upload.single("image"), auth, admin, addBrand);
brandRouter.get("/get", getAllBrands);
brandRouter.put("/update/:id", upload.single("image"), auth, admin, updateBrand);
brandRouter.delete("/delete/:id", auth, admin, deleteBrand);

export default brandRouter;
