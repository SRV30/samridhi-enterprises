import express from "express";
import upload from "../middleware/multer.js";
import {
  addPart,
  getAllParts,
  getPartById,
  updatePart,
  deletePart,
  createOrUpdateReview,
  deleteReview,
} from "../controllers/partsControllers.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";

const partRouter = express.Router();

partRouter.post("/add", upload.array("images", 5), auth, admin, addPart);
partRouter.get("/get", getAllParts);
partRouter.get("/get/:id", getPartById);
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
