import express from "express";
import auth from "../middleware/auth.js";
import validateSchema from "../middleware/validateSchema.js";
import { addVehicleSchema, updateVehicleSchema } from "../validators/garageSchemas.js";

import {
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  setDefaultVehicle,
} from "../controllers/garageController.js";

const router = express.Router();

router.post("/", auth, validateSchema(addVehicleSchema), addVehicle);
router.get("/", auth, getVehicles);
router.put("/:id", auth, validateSchema(updateVehicleSchema), updateVehicle);
router.delete("/:id", auth, deleteVehicle);
router.patch("/:id/default", auth, setDefaultVehicle);

export default router;
