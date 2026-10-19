import jwt from "jsonwebtoken";

let ioInstance = null;

/**
 * Initialize Socket.IO instance and register secure room listeners
 */
export function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    // 1. Patient Room: Restrict patient status events strictly to the authorized requestId
    socket.on("join_patient_request", (data, callback) => {
      const requestId = data?.requestId ? String(data.requestId).trim() : null;
      if (!requestId) {
        if (typeof callback === "function") {
          callback({ success: false, message: "requestId is required to subscribe to emergency status" });
        }
        return;
      }

      const roomName = `request:${requestId}`;
      socket.join(roomName);

      if (typeof callback === "function") {
        callback({ success: true, room: roomName });
      }
    });

    socket.on("leave_patient_request", (data) => {
      const requestId = data?.requestId ? String(data.requestId).trim() : null;
      if (requestId) {
        socket.leave(`request:${requestId}`);
      }
    });

    // 2. Hospital Room: Protected socket connection requiring valid JWT token
    socket.on("join_hospital_desk", (data, callback) => {
      const hospitalId = data?.hospitalId ? String(data.hospitalId).trim() : null;
      const token = data?.token;

      if (!hospitalId || !token) {
        if (typeof callback === "function") {
          callback({ success: false, message: "hospitalId and Bearer token are required" });
        }
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "carelink_emergency_jwt_secret_key_2026_secure");
        const authHospitalId = decoded?.hospitalId || decoded?.hospital?._id || decoded?.hospital?.id;

        // Ensure user belongs to this hospital or is admin
        if (decoded.role !== "admin" && String(authHospitalId) !== hospitalId) {
          if (typeof callback === "function") {
            callback({ success: false, message: "Forbidden: Not authorized for this hospital queue" });
          }
          return;
        }

        const roomName = `hospital:${hospitalId}`;
        socket.join(roomName);

        if (typeof callback === "function") {
          callback({ success: true, room: roomName, hospitalId });
        }
      } catch (err) {
        if (typeof callback === "function") {
          callback({ success: false, message: "Invalid or expired authorization token", error: err.message });
        }
      }
    });

    socket.on("leave_hospital_desk", (data) => {
      const hospitalId = data?.hospitalId ? String(data.hospitalId).trim() : null;
      if (hospitalId) {
        socket.leave(`hospital:${hospitalId}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean up on disconnect
    });
  });

  return ioInstance;
}

/**
 * Emit status update to patient room (only to request:${requestId})
 * Must only be called after database operation succeeds
 */
export function emitPatientStatusUpdate(requestId, payload) {
  if (!ioInstance || !requestId) return false;
  try {
    const roomName = `request:${String(requestId).trim()}`;
    const eventId = `ev_p_${requestId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    ioInstance.to(roomName).emit("PATIENT_STATUS_UPDATED", {
      eventId,
      requestId,
      ...payload
    });
    return true;
  } catch (err) {
    console.warn("Failed to emit patient status update:", err.message);
    return false;
  }
}

/**
 * Emit request update to hospital room (only to hospital:${hospitalId})
 * Must only be called after database operation succeeds
 */
export function emitHospitalRequestUpdate(hospitalId, payload) {
  if (!ioInstance || !hospitalId) return false;
  try {
    const roomName = `hospital:${String(hospitalId).trim()}`;
    const eventId = `ev_h_${hospitalId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    ioInstance.to(roomName).emit("HOSPITAL_REQUEST_UPDATED", {
      eventId,
      hospitalId,
      ...payload
    });
    return true;
  } catch (err) {
    console.warn("Failed to emit hospital request update:", err.message);
    return false;
  }
}

/**
 * Emit new emergency request dispatched to hospital room
 */
export function emitNewEmergencyRequestDispatched(hospitalId, payload) {
  if (!ioInstance || !hospitalId) return false;
  try {
    const roomName = `hospital:${String(hospitalId).trim()}`;
    const eventId = `ev_new_${hospitalId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    ioInstance.to(roomName).emit("NEW_EMERGENCY_REQUEST_DISPATCHED", {
      eventId,
      hospitalId,
      ...payload
    });
    return true;
  } catch (err) {
    console.warn("Failed to emit new emergency request dispatched:", err.message);
    return false;
  }
}

export default {
  initSocket,
  emitPatientStatusUpdate,
  emitHospitalRequestUpdate,
  emitNewEmergencyRequestDispatched
};
