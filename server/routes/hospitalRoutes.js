import express from "express";
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital
} from "../controllers/hospitalController.js";
import {
  getAvailability,
  updateAvailability
} from "../controllers/availabilityController.js";
import {
  getDoctors,
  addDoctor
} from "../controllers/doctorController.js";
import {
  getFacilities,
  updateFacilities
} from "../controllers/facilityController.js";
import {
  getCosts,
  updateCosts
} from "../controllers/costController.js";
import {
  getEmergencyRequests
} from "../controllers/emergencyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public & Protected Hospital CRUD
router.route("/")
  .get(getHospitals)
  .post(protect, createHospital);

router.route("/:id")
  .get(getHospitalById)
  .put(protect, updateHospital)
  .delete(protect, deleteHospital);

// Nested module endpoints: /api/hospitals/:hospitalId/...
router.route("/:hospitalId/availability")
  .get(getAvailability)
  .put(protect, updateAvailability);

router.route("/:hospitalId/doctors")
  .get(getDoctors)
  .post(protect, addDoctor);

router.route("/:hospitalId/facilities")
  .get(getFacilities)
  .put(protect, updateFacilities);

router.route("/:hospitalId/costs")
  .get(getCosts)
  .put(protect, updateCosts);

router.route("/:hospitalId/emergency-requests")
  .get(protect, getEmergencyRequests);

export default router;
