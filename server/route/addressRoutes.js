import express from "express";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import auth from "../middleware/auth.js";
import validateSchema from "../middleware/validateSchema.js";
import { addAddressSchema, updateAddressSchema } from "../validators/addressSchemas.js";

const addressRouter = express.Router();

// All address routes are scoped to the logged-in user.
addressRouter.get("/my", auth, getMyAddresses);
addressRouter.post("/add", auth, validateSchema(addAddressSchema), addAddress);
addressRouter.put("/update/:id", auth, validateSchema(updateAddressSchema), updateAddress);
addressRouter.delete("/delete/:id", auth, deleteAddress);
addressRouter.put("/default/:id", auth, setDefaultAddress);

export default addressRouter;
