import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import { getDBStatus, isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "carelink_emergency_jwt_secret_key_2026_secure",
    { expiresIn: "7d" }
  );
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, query MongoDB
    if (isMongoDBConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            let hospital = null;
            if (user.hospitalId) {
              hospital = await Hospital.findById(user.hospitalId);
              if (hospital && hospital.isActive === false) {
                return res.status(403).json({
                  success: false,
                  message: "Hospital account is deactivated. Access denied. Please contact the administrator."
                });
              }
            }

            const token = generateToken({
              id: user._id,
              email: user.email,
              role: user.role,
              hospitalId: hospital ? hospital._id : user.hospitalId
            });

            return res.json({
              success: true,
              message: "Login successful",
              data: {
                token,
                user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                },
                hospital: hospital
                  ? {
                      id: hospital._id,
                      name: hospital.name,
                      city: hospital.city,
                      status: hospital.readinessStatus
                    }
                  : null
              }
            });
          }
        }
      } catch (e) {
        console.warn("MongoDB auth query error, attempting store fallback:", e.message);
      }
    }

    // 2. Memory Store Fallback
    const candidateMockUser = mockStore.users.find(
      (u) => u.email === normalizedEmail
    );

    if (candidateMockUser && !candidateMockUser.password) {
      return res.status(401).json({
        success: false,
        message: "Demo credentials are not configured for this account. Set DEMO_HOSPITAL_PASSWORD in local environment."
      });
    }

    const mockUser = candidateMockUser && candidateMockUser.password === password
      ? candidateMockUser
      : null;

    if (mockUser) {
      const mockHospital = mockStore.hospitals.find(
        (h) => String(h._id) === String(mockUser.hospitalId)
      );

      if (mockHospital && mockHospital.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Hospital account is deactivated. Access denied. Please contact the administrator."
        });
      }

      const token = generateToken({
        id: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        hospitalId: mockUser.hospitalId
      });

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          },
          hospital: mockHospital
            ? {
                id: mockHospital._id,
                name: mockHospital.name,
                city: mockHospital.city,
                status: mockHospital.readinessStatus
              }
            : null
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    let hospital = null;

    if (isMongoDBConnected() && req.user.hospitalId) {
      try {
        hospital = await Hospital.findById(req.user.hospitalId);
      } catch {
        // ignore
      }
    }

    if (!hospital && req.user.hospitalId) {
      hospital = mockStore.hospitals.find(
        (h) => String(h._id) === String(req.user.hospitalId)
      );
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        hospital: hospital || null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHealth = (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    message: "CareLink Emergency API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus.isConnected ? "CONNECTED" : "STANDBY",
      details: dbStatus
    }
  });
};
