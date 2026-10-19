import Facility from "../models/Facility.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

// @desc    Get hospital facilities & diagnostic units
// @route   GET /api/hospitals/:hospitalId/facilities
// @access  Public
export const getFacilities = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        let facility = await Facility.findOne({ hospitalId });
        if (!facility) {
          facility = await Facility.create({ hospitalId });
        }
        return res.json({ success: true, data: facility });
      } catch (e) {
        console.warn("MongoDB getFacilities fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let facility = mockStore.facilities.find(
      (f) => String(f.hospitalId) === String(hospitalId)
    );

    if (!facility) {
      facility = {
        _id: `67010000000000000000030${mockStore.facilities.length + 1}`,
        hospitalId,
        emergency: { available: true, status: "Available", details: "24/7 Level-1 Trauma Bay" },
        icu: { available: true, status: "Available", details: "10-bed multi-parameter ICU" },
        ventilator: { available: true, status: "Available", details: "5 high-end invasive ventilators" },
        operationTheatre: { available: true, status: "Available", details: "3 active laminar airflow OTs" },
        bloodBank: { available: true, status: "Available", details: "Whole blood and component units stocked" },
        ctScan: { available: true, status: "Available", details: "128-slice high-speed emergency CT" },
        mri: { available: true, status: "Available", details: "3 Tesla Digital Wide-Bore MRI" },
        pharmacy: { available: true, status: "Available", details: "24/7 In-House Emergency Pharmacy" },
        ambulance: { available: true, status: "Available", details: "2 ACLS Cardiac Ambulances on standby" },
        dialysis: { available: true, status: "Limited", details: "Bedside emergency dialysis available" },
        nicu: { available: true, status: "Available", details: "Neonatal intensive care equipped" },
        picu: { available: true, status: "Limited", details: "4-bed pediatric intensive care unit" }
      };
      mockStore.facilities.push(facility);
    }

    res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital facilities
// @route   PUT /api/hospitals/:hospitalId/facilities
// @access  Protected
export const updateFacilities = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        let facility = await Facility.findOne({ hospitalId });
        if (!facility) {
          facility = new Facility({ hospitalId, ...req.body });
        } else {
          Object.assign(facility, req.body);
        }
        await facility.save();

        return res.json({
          success: true,
          message: "Hospital facilities updated successfully",
          data: facility
        });
      } catch (e) {
        console.warn("MongoDB updateFacilities fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let facility = mockStore.facilities.find(
      (f) => String(f.hospitalId) === String(hospitalId)
    );

    if (!facility) {
      facility = {
        _id: `67010000000000000000030${mockStore.facilities.length + 1}`,
        hospitalId,
        ...req.body
      };
      mockStore.facilities.push(facility);
    } else {
      Object.assign(facility, req.body);
    }

    res.json({
      success: true,
      message: "Hospital facilities updated successfully",
      data: facility
    });
  } catch (error) {
    next(error);
  }
};
