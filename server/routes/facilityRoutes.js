import express from "express";
import {
  getFacilities,
  updateFacilities
} from "../controllers/facilityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.route("/:hospitalId/facilities")
  .get(getFacilities)
  .put(protect, updateFacilities);

export default router;
