import mongoose from "mongoose";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import AuditLog from "../models/AuditLog.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";
import { generateToken } from "./authController.js";

/**
 * Helper to record administrative actions into AuditLog collection / fallback store
 */
async function recordAudit({ adminId, adminEmail, action, targetEntity, targetId = null, details = {}, req }) {
  try {
    const ipAddress =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      (req.socket && req.socket.remoteAddress) ||
      "127.0.0.1";

    if (isMongoDBConnected()) {
      await AuditLog.create({
        adminId,
        adminEmail,
        action,
        targetEntity,
        targetId: targetId ? String(targetId) : null,
        details,
        ipAddress
      });
    } else {
      mockStore.auditLogs.unshift({
        _id: "audit_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        adminId,
        adminEmail,
        action,
        targetEntity,
        targetId: targetId ? String(targetId) : null,
        details,
        ipAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
}

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public (Admin role required)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both administrator email and password"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMongoDBConnected()) {
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid administrator credentials"
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid administrator credentials"
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied: Account does not have administrator privileges"
        });
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: "admin",
        hospitalId: null
      });

      await recordAudit({
        adminId: user._id,
        adminEmail: user.email,
        action: "ADMIN_LOGIN",
        targetEntity: "User",
        targetId: user._id,
        details: { email: user.email },
        req
      });

      return res.json({
        success: true,
        message: "Administrator authenticated successfully",
        data: {
          token,
          admin: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    }

    // Memory Store Fallback
    const candidateAdmin = mockStore.users.find(
      (u) => u.email === normalizedEmail
    );

    if (candidateAdmin && !candidateAdmin.password) {
      return res.status(401).json({
        success: false,
        message: "Administrator password is not configured. Set ADMIN_PASSWORD in local environment."
      });
    }

    const mockUser = candidateAdmin && candidateAdmin.password === password
      ? candidateAdmin
      : null;

    if (!mockUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials"
      });
    }

    if (mockUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Account does not have administrator privileges"
      });
    }

    const token = generateToken({
      id: mockUser._id,
      email: mockUser.email,
      role: "admin",
      hospitalId: null
    });

    await recordAudit({
      adminId: mockUser._id,
      adminEmail: mockUser.email,
      action: "ADMIN_LOGIN",
      targetEntity: "User",
      targetId: mockUser._id,
      details: { email: mockUser.email },
      req
    });

    return res.json({
      success: true,
      message: "Administrator authenticated successfully",
      data: {
        token,
        admin: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin authentication error: " + error.message
    });
  }
};

// @desc    Get Current Admin Profile
// @route   GET /api/admin/me
// @access  Private (Admin Only)
export const getAdminMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

// @desc    Get Aggregated Dashboard Statistics from live database records
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
export const getAdminStats = async (req, res) => {
  try {
    if (isMongoDBConnected()) {
      const [
        totalHospitals,
        activeHospitals,
        deactivatedHospitals,
        readyHospitals,
        limitedHospitals,
        notReadyHospitals,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        underReviewRequests,
        completedRequests,
        cancelledRequests,
        recentEmergencies,
        recentAuditLogs
      ] = await Promise.all([
        Hospital.countDocuments({}),
        Hospital.countDocuments({ isActive: { $ne: false } }),
        Hospital.countDocuments({ isActive: false }),
        Hospital.countDocuments({ readinessStatus: "READY", isActive: { $ne: false } }),
        Hospital.countDocuments({ readinessStatus: "LIMITED", isActive: { $ne: false } }),
        Hospital.countDocuments({ readinessStatus: "NOT_READY", isActive: { $ne: false } }),
        EmergencyRequest.countDocuments({}),
        EmergencyRequest.countDocuments({ status: "PENDING" }),
        EmergencyRequest.countDocuments({ status: "ACCEPTED" }),
        EmergencyRequest.countDocuments({ status: "REJECTED" }),
        EmergencyRequest.countDocuments({ status: "UNDER_REVIEW" }),
        EmergencyRequest.countDocuments({ status: "COMPLETED" }),
        EmergencyRequest.countDocuments({ status: "CANCELLED" }),
        EmergencyRequest.find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .select("patientName emergencyType status hospitalResponse requiredBedType contactPhone createdAt updatedAt")
          .lean(),
        AuditLog.find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ]);

      return res.json({
        success: true,
        data: {
          hospitals: {
            total: totalHospitals,
            active: activeHospitals,
            deactivated: deactivatedHospitals,
            ready: readyHospitals,
            limited: limitedHospitals,
            notReady: notReadyHospitals
          },
          requests: {
            total: totalRequests,
            pending: pendingRequests,
            accepted: acceptedRequests,
            rejected: rejectedRequests,
            underReview: underReviewRequests,
            completed: completedRequests,
            cancelled: cancelledRequests
          },
          recentEmergencies,
          recentAuditLogs
        }
      });
    }

    // MockStore fallback
    const totalHospitals = mockStore.hospitals.length;
    const activeHospitals = mockStore.hospitals.filter((h) => h.isActive !== false).length;
    const deactivatedHospitals = mockStore.hospitals.filter((h) => h.isActive === false).length;
    const readyHospitals = mockStore.hospitals.filter((h) => h.readinessStatus === "READY" && h.isActive !== false).length;
    const limitedHospitals = mockStore.hospitals.filter((h) => h.readinessStatus === "LIMITED" && h.isActive !== false).length;
    const notReadyHospitals = mockStore.hospitals.filter((h) => h.readinessStatus === "NOT_READY" && h.isActive !== false).length;

    const totalRequests = mockStore.emergencyRequests.length;
    const pendingRequests = mockStore.emergencyRequests.filter((r) => r.status === "PENDING").length;
    const acceptedRequests = mockStore.emergencyRequests.filter((r) => r.status === "ACCEPTED").length;
    const rejectedRequests = mockStore.emergencyRequests.filter((r) => r.status === "REJECTED").length;
    const underReviewRequests = mockStore.emergencyRequests.filter((r) => r.status === "UNDER_REVIEW").length;
    const completedRequests = mockStore.emergencyRequests.filter((r) => r.status === "COMPLETED").length;
    const cancelledRequests = mockStore.emergencyRequests.filter((r) => r.status === "CANCELLED").length;

    const recentEmergencies = [...mockStore.emergencyRequests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const recentAuditLogs = [...(mockStore.auditLogs || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        hospitals: {
          total: totalHospitals,
          active: activeHospitals,
          deactivated: deactivatedHospitals,
          ready: readyHospitals,
          limited: limitedHospitals,
          notReady: notReadyHospitals
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          rejected: rejectedRequests,
          underReview: underReviewRequests,
          completed: completedRequests,
          cancelled: cancelledRequests
        },
        recentEmergencies,
        recentAuditLogs
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics: " + error.message
    });
  }
};

// @desc    Get Hospital List with filters and pagination
// @route   GET /api/admin/hospitals
// @access  Private (Admin Only)
export const getAdminHospitals = async (req, res) => {
  try {
    const { search, status, city, readinessStatus } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    if (isMongoDBConnected()) {
      const query = {};

      if (status === "active") {
        query.isActive = { $ne: false };
      } else if (status === "deactivated") {
        query.isActive = false;
      }

      if (city && city.trim() && city !== "ALL") {
        query.city = new RegExp(city.trim(), "i");
      }

      if (readinessStatus && readinessStatus.trim() && readinessStatus !== "ALL") {
        query.readinessStatus = readinessStatus.trim();
      }

      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { name: new RegExp(s, "i") },
          { address: new RegExp(s, "i") },
          { city: new RegExp(s, "i") },
          { phone: new RegExp(s, "i") }
        ];
      }

      const [total, hospitals] = await Promise.all([
        Hospital.countDocuments(query),
        Hospital.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("deactivatedBy", "name email")
          .lean()
      ]);

      return res.json({
        success: true,
        count: hospitals.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: hospitals
      });
    }

    // Fallback store
    let filtered = [...mockStore.hospitals];

    if (status === "active") {
      filtered = filtered.filter((h) => h.isActive !== false);
    } else if (status === "deactivated") {
      filtered = filtered.filter((h) => h.isActive === false);
    }

    if (city && city.trim() && city !== "ALL") {
      filtered = filtered.filter((h) => h.city.toLowerCase().includes(city.trim().toLowerCase()));
    }

    if (readinessStatus && readinessStatus.trim() && readinessStatus !== "ALL") {
      filtered = filtered.filter((h) => h.readinessStatus === readinessStatus.trim());
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(s) ||
          h.address.toLowerCase().includes(s) ||
          h.city.toLowerCase().includes(s) ||
          (h.phone && h.phone.includes(s))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: paginated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve hospitals: " + error.message
    });
  }
};

// @desc    Get Single Hospital with profile, doctor count, availability
// @route   GET /api/admin/hospitals/:id
// @access  Private (Admin Only)
export const getAdminHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      const hospital = await Hospital.findById(id).populate("deactivatedBy", "name email").lean();
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found"
        });
      }

      const [availability, doctors] = await Promise.all([
        Availability.findOne({ hospitalId: hospital._id }).lean(),
        Doctor.find({ hospitalId: hospital._id }).lean()
      ]);

      return res.json({
        success: true,
        data: {
          ...hospital,
          availability: availability || null,
          doctors: doctors || [],
          doctorCount: doctors ? doctors.length : 0
        }
      });
    }

    const hospital = mockStore.hospitals.find(
      (h) => String(h._id) === String(id) || String(h.id) === String(id)
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    const availability = mockStore.availability.find(
      (a) => String(a.hospitalId) === String(hospital._id) || String(a.hospitalId) === String(hospital.id)
    );

    const doctors = mockStore.doctors.filter(
      (d) => String(d.hospitalId) === String(hospital._id) || String(d.hospitalId) === String(hospital.id)
    );

    return res.json({
      success: true,
      data: {
        ...hospital,
        availability: availability || null,
        doctors: doctors || [],
        doctorCount: doctors.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital: " + error.message
    });
  }
};

// @desc    Reversibly Activate or Deactivate Hospital
// @route   PATCH /api/admin/hospitals/:id/status
// @access  Private (Admin Only)
export const updateHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Field 'isActive' must be a boolean (true or false)"
      });
    }

    if (!isActive && (!reason || !reason.trim())) {
      return res.status(400).json({
        success: false,
        message: "A deactivation reason is required"
      });
    }

    const adminId = req.user._id || req.user.id;
    const adminEmail = req.user.email;

    if (isMongoDBConnected()) {
      const hospital = await Hospital.findById(id);

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found"
        });
      }

      const previousStatus = hospital.isActive !== false;
      hospital.isActive = isActive;

      if (!isActive) {
        hospital.statusReason = reason.trim();
        hospital.deactivatedAt = new Date();
        hospital.deactivatedBy = adminId;
      } else {
        hospital.statusReason = null;
        hospital.deactivatedAt = null;
        hospital.deactivatedBy = null;
      }

      await hospital.save();

      await recordAudit({
        adminId,
        adminEmail,
        action: isActive ? "HOSPITAL_ACTIVATED" : "HOSPITAL_DEACTIVATED",
        targetEntity: "Hospital",
        targetId: hospital._id,
        details: {
          hospitalName: hospital.name,
          city: hospital.city,
          reason: hospital.statusReason,
          previousStatus
        },
        req
      });

      return res.json({
        success: true,
        message: `Hospital '${hospital.name}' has been ${isActive ? "activated" : "deactivated"} successfully`,
        data: hospital
      });
    }

    // MockStore fallback
    const hospital = mockStore.hospitals.find(
      (h) => String(h._id) === String(id) || String(h.id) === String(id)
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    hospital.isActive = isActive;
    if (!isActive) {
      hospital.statusReason = reason.trim();
      hospital.deactivatedAt = new Date().toISOString();
      hospital.deactivatedBy = adminId;
    } else {
      hospital.statusReason = null;
      hospital.deactivatedAt = null;
      hospital.deactivatedBy = null;
    }

    await recordAudit({
      adminId,
      adminEmail,
      action: isActive ? "HOSPITAL_ACTIVATED" : "HOSPITAL_DEACTIVATED",
      targetEntity: "Hospital",
      targetId: hospital._id,
      details: {
        hospitalName: hospital.name,
        city: hospital.city,
        reason: hospital.statusReason
      },
      req
    });

    return res.json({
      success: true,
      message: `Hospital '${hospital.name}' has been ${isActive ? "activated" : "deactivated"} successfully`,
      data: hospital
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update hospital status: " + error.message
    });
  }
};

// @desc    Get Emergency Requests for Monitoring (Read-Only)
// @route   GET /api/admin/emergencies
// @access  Private (Admin Only)
export const getAdminEmergencies = async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    if (isMongoDBConnected()) {
      const query = {};

      if (status && status.trim() && status !== "ALL") {
        query.status = status.trim().toUpperCase();
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      if (search && search.trim()) {
        const s = search.trim();
        const orConditions = [
          { patientName: new RegExp(s, "i") },
          { emergencyType: new RegExp(s, "i") },
          { contactPhone: new RegExp(s, "i") }
        ];

        if (mongoose.Types.ObjectId.isValid(s)) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(s) });
        }

        query.$or = orConditions;
      }

      const [total, requests] = await Promise.all([
        EmergencyRequest.countDocuments(query),
        EmergencyRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      return res.json({
        success: true,
        count: requests.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: requests
      });
    }

    // MockStore fallback
    let filtered = [...mockStore.emergencyRequests];

    if (status && status.trim() && status !== "ALL") {
      filtered = filtered.filter((r) => r.status === status.trim().toUpperCase());
    }

    if (dateFrom) {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= end);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.patientName.toLowerCase().includes(s) ||
          r.emergencyType.toLowerCase().includes(s) ||
          (r.contactPhone && r.contactPhone.includes(s)) ||
          String(r._id).includes(s)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: paginated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve emergency requests: " + error.message
    });
  }
};

// @desc    Get Detailed Emergency Request by ID (Read-Only)
// @route   GET /api/admin/emergencies/:id
// @access  Private (Admin Only)
export const getAdminEmergencyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      const request = await EmergencyRequest.findById(id).lean();

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Emergency request not found"
        });
      }

      return res.json({
        success: true,
        data: request
      });
    }

    const request = mockStore.emergencyRequests.find(
      (r) => String(r._id) === String(id) || String(r.id) === String(id)
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found"
      });
    }

    return res.json({
      success: true,
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency request: " + error.message
    });
  }
};

// @desc    Get Administrative Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin Only)
export const getAdminAuditLogs = async (req, res) => {
  try {
    const { action, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    if (isMongoDBConnected()) {
      const query = {};

      if (action && action.trim() && action !== "ALL") {
        query.action = action.trim();
      }

      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { adminEmail: new RegExp(s, "i") },
          { targetEntity: new RegExp(s, "i") },
          { targetId: new RegExp(s, "i") },
          { action: new RegExp(s, "i") }
        ];
      }

      const [total, logs] = await Promise.all([
        AuditLog.countDocuments(query),
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      return res.json({
        success: true,
        count: logs.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: logs
      });
    }

    // Fallback store
    let filtered = [...(mockStore.auditLogs || [])];

    if (action && action.trim() && action !== "ALL") {
      filtered = filtered.filter((l) => l.action === action.trim());
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.adminEmail && l.adminEmail.toLowerCase().includes(s)) ||
          (l.targetEntity && l.targetEntity.toLowerCase().includes(s)) ||
          (l.targetId && l.targetId.toLowerCase().includes(s)) ||
          (l.action && l.action.toLowerCase().includes(s))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: paginated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs: " + error.message
    });
  }
};
