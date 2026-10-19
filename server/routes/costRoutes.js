import express from "express";
import {
  getCosts,
  updateCosts
} from "../controllers/costController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.route("/:hospitalId/costs")
  .get(getCosts)
  .put(protect, updateCosts);

export default router;
