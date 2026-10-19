import Doctor from "../models/Doctor.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

// @desc    Get all doctors/specialists for a hospital
// @route   GET /api/hospitals/:hospitalId/doctors
// @access  Public
export const getDoctors = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (isMongoDBConnected()) {
      try {
        const doctors = await Doctor.find({ hospitalId }).sort({ createdAt: -1 });
        return res.json({
          success: true,
          count: doctors.length,
          data: doctors
        });
      } catch (e) {
        console.warn("MongoDB getDoctors fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const doctors = mockStore.doctors.filter(
      (d) => String(d.hospitalId) === String(hospitalId)
    );

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a doctor/specialist to a hospital
// @route   POST /api/hospitals/:hospitalId/doctors
// @access  Protected
export const addDoctor = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const {
      name,
      specialization,
      department,
      qualification,
      experience,
      status,
      workingHours,
      phone
    } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Doctor name and specialization are required"
      });
    }

    if (isMongoDBConnected()) {
      try {
        const doctor = await Doctor.create({
          hospitalId,
          name,
          specialization,
          department: department || specialization,
          qualification: qualification || "MBBS, MD",
          experience: experience || "8 years experience",
          status: status || "ON_DUTY",
          workingHours: workingHours || "8 AM – 8 PM",
          phone: phone || ""
        });

        return res.status(201).json({
          success: true,
          message: "Doctor added successfully",
          data: doctor
        });
      } catch (e) {
        console.warn("MongoDB addDoctor fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const newDoc = {
      _id: `67010000000000000000020${mockStore.doctors.length + 1}`,
      id: `67010000000000000000020${mockStore.doctors.length + 1}`,
      hospitalId,
      name,
      specialization,
      department: department || specialization,
      qualification: qualification || "MBBS, MD",
      experience: experience || "8 years experience",
      status: status || "ON_DUTY",
      workingHours: workingHours || "8 AM – 8 PM",
      phone: phone || "",
      createdAt: new Date().toISOString()
    };

    mockStore.doctors.unshift(newDoc);

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Protected
export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      try {
        const doctor = await Doctor.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });

        if (doctor) {
          return res.json({
            success: true,
            message: "Doctor updated successfully",
            data: doctor
          });
        }
      } catch (e) {
        console.warn("MongoDB updateDoctor fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const idx = mockStore.doctors.findIndex(
      (d) => String(d._id) === String(id) || String(d.id) === String(id)
    );

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    mockStore.doctors[idx] = {
      ...mockStore.doctors[idx],
      ...req.body
    };

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: mockStore.doctors[idx]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Protected
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      try {
        const doctor = await Doctor.findByIdAndDelete(id);
        if (doctor) {
          return res.json({
            success: true,
            message: "Doctor removed from roster successfully"
          });
        }
      } catch (e) {
        console.warn("MongoDB deleteDoctor fallback:", e.message);
      }
    }

    // Memory Store Fallback
    const initialLen = mockStore.doctors.length;
    mockStore.doctors = mockStore.doctors.filter(
      (d) => String(d._id) !== String(id) && String(d.id) !== String(id)
    );

    if (mockStore.doctors.length === initialLen) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      message: "Doctor removed from roster successfully"
    });
  } catch (error) {
    next(error);
  }
};
