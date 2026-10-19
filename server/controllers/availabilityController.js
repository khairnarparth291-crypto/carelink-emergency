import Availability from "../models/Availability.js";
import Hospital from "../models/Hospital.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

function sanitizeBed(inputBed, existingBed = { total: 0, occupied: 0, available: 0 }) {
  if (!inputBed) return existingBed;
  const total = inputBed.total !== undefined ? Math.max(0, Number(inputBed.total) || 0) : existingBed.total;
  let occupied = inputBed.occupied !== undefined ? Math.max(0, Number(inputBed.occupied) || 0) : existingBed.occupied;
  occupied = Math.min(total, occupied);
  const available = Math.max(0, total - occupied);
  return { total, occupied, available };
}

// @desc    Get hospital bed availability
// @route   GET /api/hospitals/:hospitalId/availability
// @access  Public
export const getAvailability = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        let availability = await Availability.findOne({ hospitalId });
        if (!availability) {
          availability = await Availability.create({
            hospitalId,
            normalBeds: { total: 40, occupied: 18, available: 22 },
            icuBeds: { total: 10, occupied: 7, available: 3 },
            ventilators: { total: 5, occupied: 3, available: 2 },
            emergencyBeds: { total: 8, occupied: 4, available: 4 }
          });
        }
        return res.json({ success: true, data: availability });
      } catch (e) {
        console.warn("MongoDB getAvailability fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let availability = mockStore.availabilities.find(
      (a) => String(a.hospitalId) === String(hospitalId)
    );

    if (!availability) {
      availability = {
        _id: `67010000000000000000010${mockStore.availabilities.length + 1}`,
        hospitalId,
        normalBeds: { total: 40, occupied: 18, available: 22 },
        icuBeds: { total: 10, occupied: 7, available: 3 },
        ventilators: { total: 5, occupied: 3, available: 2 },
        emergencyBeds: { total: 8, occupied: 4, available: 4 },
        lastUpdated: new Date().toISOString()
      };
      mockStore.availabilities.push(availability);
    }

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital bed availability
// @route   PUT /api/hospitals/:hospitalId/availability
// @access  Protected
export const updateAvailability = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const normalBeds = req.body.normalBeds || req.body.generalBeds;
    const icuBeds = req.body.icuBeds;
    const ventilators = req.body.ventilators || req.body.ventilatorBeds;
    const emergencyBeds = req.body.emergencyBeds;

    if (isMongoDBConnected()) {
      try {
        let availability = await Availability.findOne({ hospitalId });
        if (!availability) {
          availability = new Availability({ hospitalId });
        }

        if (normalBeds) availability.normalBeds = sanitizeBed(normalBeds, availability.normalBeds);
        if (icuBeds) availability.icuBeds = sanitizeBed(icuBeds, availability.icuBeds);
        if (ventilators) availability.ventilators = sanitizeBed(ventilators, availability.ventilators);
        if (emergencyBeds) availability.emergencyBeds = sanitizeBed(emergencyBeds, availability.emergencyBeds);

        availability.lastUpdated = new Date();
        await availability.save();

        try {
          await Hospital.findByIdAndUpdate(hospitalId, { lastVerified: "Just now" });
        } catch {
          // ignore
        }

        const responseData = availability.toObject ? availability.toObject() : { ...availability };
        responseData.generalBeds = responseData.normalBeds;
        responseData.ventilatorBeds = responseData.ventilators;

        return res.json({
          success: true,
          message: "Bed availability updated successfully",
          data: responseData
        });
      } catch (e) {
        console.warn("MongoDB updateAvailability fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let availability = mockStore.availabilities.find(
      (a) => String(a.hospitalId) === String(hospitalId)
    );

    if (!availability) {
      availability = {
        _id: `67010000000000000000010${mockStore.availabilities.length + 1}`,
        hospitalId,
        normalBeds: { total: 40, occupied: 18, available: 22 },
        icuBeds: { total: 10, occupied: 7, available: 3 },
        ventilators: { total: 5, occupied: 3, available: 2 },
        emergencyBeds: { total: 8, occupied: 4, available: 4 },
        lastUpdated: new Date().toISOString()
      };
      mockStore.availabilities.push(availability);
    }

    if (normalBeds) availability.normalBeds = sanitizeBed(normalBeds, availability.normalBeds);
    if (icuBeds) availability.icuBeds = sanitizeBed(icuBeds, availability.icuBeds);
    if (ventilators) availability.ventilators = sanitizeBed(ventilators, availability.ventilators);
    if (emergencyBeds) availability.emergencyBeds = sanitizeBed(emergencyBeds, availability.emergencyBeds);

    availability.lastUpdated = new Date().toISOString();

    const hospital = mockStore.hospitals.find((h) => String(h._id) === String(hospitalId));
    if (hospital) {
      hospital.lastVerified = "Just now";
    }

    const responseData = { ...availability };
    responseData.generalBeds = responseData.normalBeds;
    responseData.ventilatorBeds = responseData.ventilators;

    res.json({
      success: true,
      message: "Bed availability updated successfully",
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};
