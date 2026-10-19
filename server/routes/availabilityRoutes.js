import express from "express";
import {
  getAvailability,
  updateAvailability
} from "../controllers/availabilityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.route("/:hospitalId/availability")
  .get(getAvailability)
  .put(protect, updateAvailability);

export default router;
