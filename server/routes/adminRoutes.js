import express from "express";
import {
  loginAdmin,
  getAdminMe,
  getAdminStats,
  getAdminHospitals,
  getAdminHospitalById,
  updateHospitalStatus,
  getAdminEmergencies,
  getAdminEmergencyById,
  getAdminAuditLogs
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Admin Login (Requires administrator credentials)
router.post("/login", loginAdmin);

// All subsequent routes require a valid token and the 'admin' role
router.use(protect);
router.use(requireAdmin);

// Admin Profile
router.get("/me", getAdminMe);

// Dashboard Statistics (aggregated from live DB)
router.get("/stats", getAdminStats);

// Hospital Management
router.get("/hospitals", getAdminHospitals);
router.get("/hospitals/:id", getAdminHospitalById);
router.patch("/hospitals/:id/status", updateHospitalStatus);

// Emergency Request Monitoring (READ-ONLY)
router.get("/emergencies", getAdminEmergencies);
router.get("/emergencies/:id", getAdminEmergencyById);

// Audit Logging
router.get("/audit-logs", getAdminAuditLogs);

export default router;
