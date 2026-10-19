import express from "express";
import {
  createEmergencyRequest,
  getEmergencyRequestById,
  reviewEmergencyRequest,
  acceptEmergencyRequest,
  rejectEmergencyRequest,
  completeEmergencyRequest,
  dispatchEmergencyRequest,
  getEmergencyResponses,
  reviewHospitalEmergencyResponse,
  acceptHospitalEmergencyResponse,
  rejectHospitalEmergencyResponse
} from "../controllers/emergencyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public patient endpoints
router.post("/", createEmergencyRequest);
router.get("/:id", getEmergencyRequestById);
router.post("/:id/dispatch", dispatchEmergencyRequest);
router.get("/:id/responses", getEmergencyResponses);

// Protected hospital actions (Part 4A single-action compatibility)
router.put("/:id/review", protect, reviewEmergencyRequest);
router.put("/:id/accept", protect, acceptEmergencyRequest);
router.put("/:id/reject", protect, rejectEmergencyRequest);
router.put("/:id/complete", protect, completeEmergencyRequest);

// Protected hospital-specific multi-hospital actions (Part 4B)
router.put("/:id/hospitals/:hospitalId/review", protect, reviewHospitalEmergencyResponse);
router.put("/:id/hospitals/:hospitalId/accept", protect, acceptHospitalEmergencyResponse);
router.put("/:id/hospitals/:hospitalId/reject", protect, rejectHospitalEmergencyResponse);

export default router;
