import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import { isMongoDBConnected } from "../config/db.js";
import mockStore from "../config/mockStore.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "carelink_emergency_jwt_secret_key_2026_secure"
      );

      let user = null;
      if (isMongoDBConnected()) {
        try {
          user = await User.findById(decoded.id).select("-password");
        } catch {
          // Fall through to decoded token payload
        }
      }

      req.user = user || {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || "hospital",
        hospitalId: decoded.hospitalId
      };

      // Invalidate / deny access if user's associated hospital is deactivated
      const hospId = req.user.hospitalId || decoded.hospitalId;
      if (hospId && req.user.role !== "admin") {
        let hospital = null;
        if (isMongoDBConnected()) {
          try {
            hospital = await Hospital.findById(hospId).select("isActive name");
          } catch {}
        }
        if (!hospital) {
          hospital = mockStore.hospitals.find(
            (h) => String(h._id) === String(hospId) || String(h.id) === String(hospId)
          );
        }

        if (hospital && hospital.isActive === false) {
          return res.status(403).json({
            success: false,
            message: "Hospital account is deactivated. Access denied. Please contact the administrator."
          });
        }
      }

      return next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Not authorized: Invalid or expired token"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized: No Bearer token provided"
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(", ")}] roles`
      });
    }
    next();
  };
};

export const requireAdmin = requireRole("admin");
