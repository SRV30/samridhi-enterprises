// routes/bikeModelRoutes.js

import express from "express";
import upload from "../middleware/multer.js";
import {
  addBikeModel,
  getAllBikeModels,
  updateBikeModel,
  deleteBikeModel,
} from "../controllers/bikeControllers.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";

const bikeModelRouter = express.Router();

bikeModelRouter.post("/add", upload.single("image"), auth, admin, addBikeModel);
bikeModelRouter.get("/get", getAllBikeModels);
bikeModelRouter.put(
  "/update/:id",
  upload.single("image"),
  auth,
  admin,
  updateBikeModel
);
bikeModelRouter.delete("/delete/:id", auth, admin, deleteBikeModel);

export default bikeModelRouter;
