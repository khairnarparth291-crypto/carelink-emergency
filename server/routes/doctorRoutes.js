import express from "express";
import {
  updateDoctor,
  deleteDoctor
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Direct doctor routes: PUT /api/doctors/:id, DELETE /api/doctors/:id
router.route("/:id")
  .put(protect, updateDoctor)
  .delete(protect, deleteDoctor);

export default router;
