import Hospital from "../models/Hospital.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
import Facility from "../models/Facility.js";
import Cost from "../models/Cost.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

// @desc    Get all hospitals (public)
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req, res, next) => {
  try {
    const { city, readinessStatus, search } = req.query;

    if (isMongoDBConnected()) {
      try {
        const query = {};
        if (city && city.trim()) {
          const cleanCity = city.split(",")[0].trim();
          query.city = new RegExp(cleanCity, "i");
        }
        if (readinessStatus) query.readinessStatus = readinessStatus;
        if (search) {
          query.$or = [
            { name: new RegExp(search, "i") },
            { address: new RegExp(search, "i") },
            { city: new RegExp(search, "i") }
          ];
        }

        const hospitals = await Hospital.find(query).sort({ createdAt: -1 });
        const hospitalIds = hospitals.map((h) => h._id);
        const [availabilities, doctors] = await Promise.all([
          Availability.find({ hospitalId: { $in: hospitalIds } }),
          Doctor.find({ hospitalId: { $in: hospitalIds } })
        ]);
        const availMap = new Map();
        availabilities.forEach((a) => availMap.set(String(a.hospitalId), a));
        const docMap = new Map();
        doctors.forEach((d) => {
          const hid = String(d.hospitalId);
          if (!docMap.has(hid)) docMap.set(hid, []);
          docMap.get(hid).push(d);
        });

        const enrichedHospitals = hospitals.map((h) => {
          const hObj = h.toObject();
          const avail = availMap.get(String(h._id));
          if (avail) hObj.availability = avail;
          hObj.doctors = docMap.get(String(h._id)) || [];
          return hObj;
        });

        if (enrichedHospitals.length > 0) {
          return res.json({
            success: true,
            count: enrichedHospitals.length,
            data: enrichedHospitals
          });
        }

        // If MongoDB contains hospitals but none matched query, return empty list.
        // If MongoDB has 0 hospitals total, fall through to mockStore.
        const totalHospitalsInDb = await Hospital.countDocuments();
        if (totalHospitalsInDb > 0) {
          return res.json({
            success: true,
            count: 0,
            data: []
          });
        }
      } catch (e) {
        console.warn("MongoDB hospital query fallback:", e.message);
      }
    }

    // Memory Store Fallback
    let result = mockStore.hospitals.map((h) => {
      const avail = mockStore.availabilities.find(
        (a) => String(a.hospitalId) === String(h._id)
      );
      const docs = mockStore.doctors.filter(
        (d) => String(d.hospitalId) === String(h._id)
      );
      return { ...h, availability: avail || null, doctors: docs };
    });

    if (city && city.trim()) {
      const cleanCity = city.split(",")[0].trim().toLowerCase();
      result = result.filter((h) => (h.city || "").toLowerCase().includes(cleanCity));
    }
    if (readinessStatus) {
      result = result.filter((h) => h.readinessStatus === readinessStatus);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(s) ||
          h.address.toLowerCase().includes(s) ||
          h.city.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital details with availability, doctors, facilities, costs
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      try {
        const hospital = await Hospital.findById(id);
        if (hospital) {
          const [availability, doctors, facility, cost] = await Promise.all([
            Availability.findOne({ hospitalId: hospital._id }),
            Doctor.find({ hospitalId: hospital._id }),
            Facility.findOne({ hospitalId: hospital._id }),
            Cost.findOne({ hospitalId: hospital._id })
          ]);

          return res.json({
            success: true,
            data: {
              ...hospital.toObject(),
              availability: availability || null,
              doctors: doctors || [],
              facilities: facility || null,
              costs: cost || null
            }
          });
        }
      } catch (e) {
        console.warn("MongoDB getHospitalById error, checking fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const hospital = mockStore.hospitals.find(
      (h) => String(h._id) === String(id) || String(h.id) === String(id)
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    const availability = mockStore.availabilities.find(
      (a) => String(a.hospitalId) === String(hospital._id)
    );
    const doctors = mockStore.doctors.filter(
      (d) => String(d.hospitalId) === String(hospital._id)
    );
    const facility = mockStore.facilities.find(
      (f) => String(f.hospitalId) === String(hospital._id)
    );
    const cost = mockStore.costs.find(
      (c) => String(c.hospitalId) === String(hospital._id)
    );

    res.json({
      success: true,
      data: {
        ...hospital,
        availability: availability || null,
        doctors: doctors || [],
        facilities: facility || null,
        costs: cost || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hospital
// @route   POST /api/hospitals
// @access  Protected
export const createHospital = async (req, res, next) => {
  try {
    if (isMongoDBConnected()) {
      try {
        const hospitalData = {
          ...req.body,
          userId: req.user._id
        };
        const hospital = await Hospital.create(hospitalData);
        await Promise.all([
          Availability.create({ hospitalId: hospital._id }),
          Facility.create({ hospitalId: hospital._id }),
          Cost.create({ hospitalId: hospital._id })
        ]);
        return res.status(201).json({
          success: true,
          message: "Hospital created successfully",
          data: hospital
        });
      } catch (e) {
        console.warn("MongoDB createHospital fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const newHospital = {
      _id: `6701000000000000000000${mockStore.hospitals.length + 10}`,
      id: `6701000000000000000000${mockStore.hospitals.length + 10}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    mockStore.hospitals.push(newHospital);

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: newHospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Protected
export const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      try {
        const updated = await Hospital.findByIdAndUpdate(
          id,
          { ...req.body, lastVerified: "Just now" },
          { new: true, runValidators: true }
        );
        if (updated) {
          return res.json({
            success: true,
            message: "Hospital updated successfully",
            data: updated
          });
        }
      } catch (e) {
        console.warn("MongoDB updateHospital fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const idx = mockStore.hospitals.findIndex(
      (h) => String(h._id) === String(id) || String(h.id) === String(id)
    );

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    mockStore.hospitals[idx] = {
      ...mockStore.hospitals[idx],
      ...req.body,
      lastVerified: "Just now"
    };

    res.json({
      success: true,
      message: "Hospital updated successfully",
      data: mockStore.hospitals[idx]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Protected
export const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      try {
        await Promise.all([
          Hospital.findByIdAndDelete(id),
          Availability.deleteMany({ hospitalId: id }),
          Doctor.deleteMany({ hospitalId: id }),
          Facility.deleteMany({ hospitalId: id }),
          Cost.deleteMany({ hospitalId: id })
        ]);
        return res.json({
          success: true,
          message: "Hospital and associated records removed successfully"
        });
      } catch (e) {
        console.warn("MongoDB deleteHospital fallback:", e.message);
      }
    }

    // Memory Store Fallback
    mockStore.hospitals = mockStore.hospitals.filter((h) => String(h._id) !== String(id));
    mockStore.availabilities = mockStore.availabilities.filter((a) => String(a.hospitalId) !== String(id));
    mockStore.doctors = mockStore.doctors.filter((d) => String(d.hospitalId) !== String(id));
    mockStore.facilities = mockStore.facilities.filter((f) => String(f.hospitalId) !== String(id));
    mockStore.costs = mockStore.costs.filter((c) => String(c.hospitalId) !== String(id));

    res.json({
      success: true,
      message: "Hospital and associated records removed successfully"
    });
  } catch (error) {
    next(error);
  }
};
