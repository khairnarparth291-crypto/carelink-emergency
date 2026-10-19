/**
 * CareLink Emergency - Real-Time Socket.IO Client Service (Phase C)
 *
 * Provides resilient, room-scoped real-time updates for:
 * 1. Patient Emergency Status (room: request:${requestId})
 * 2. Hospital Emergency Desk Queue (room: hospital:${hospitalId}, JWT-authenticated)
 *
 * Includes event deduplication, automatic room re-joining on reconnection,
 * and maintains HTTP polling as an active fallback.
 */

import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, "");

let socket = null;
const processedEventIds = new Set();
const activePatientSubscriptions = new Map(); // requestId -> Set of callbacks
const activeHospitalSubscriptions = new Map(); // hospitalId -> { token, callbacks: Set }

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      // Re-join active rooms on reconnection
      activePatientSubscriptions.forEach((_, requestId) => {
        socket.emit("join_patient_request", { requestId });
      });

      activeHospitalSubscriptions.forEach(({ token }, hospitalId) => {
        if (token) {
          socket.emit("join_hospital_desk", { hospitalId, token });
        }
      });
    });

    socket.on("connect_error", (err) => {
      // Graceful fallback to HTTP polling
      console.warn("Real-time socket connection offline, using HTTP polling fallback:", err.message);
    });

    // Patient status update listener
    socket.on("PATIENT_STATUS_UPDATED", (event) => {
      if (!event) return;
      const eventId = event.eventId;
      if (eventId && processedEventIds.has(eventId)) {
        return; // Prevent duplicate event processing
      }
      if (eventId) {
        processedEventIds.add(eventId);
        if (processedEventIds.size > 200) {
          const first = processedEventIds.values().next().value;
          processedEventIds.delete(first);
        }
      }

      const requestId = event.requestId;
      const callbacks = activePatientSubscriptions.get(requestId);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (e) {
            console.error("Error executing patient status update callback:", e);
          }
        });
      }
    });

    // Hospital desk update listeners
    socket.on("HOSPITAL_REQUEST_UPDATED", (event) => {
      if (!event) return;
      const eventId = event.eventId;
      if (eventId && processedEventIds.has(eventId)) return;
      if (eventId) {
        processedEventIds.add(eventId);
        if (processedEventIds.size > 200) {
          const first = processedEventIds.values().next().value;
          processedEventIds.delete(first);
        }
      }

      const hospitalId = event.hospitalId;
      const sub = activeHospitalSubscriptions.get(hospitalId);
      if (sub && sub.callbacks) {
        sub.callbacks.forEach((cb) => {
          try {
            cb({ type: "REQUEST_UPDATED", ...event });
          } catch (e) {
            console.error("Error executing hospital update callback:", e);
          }
        });
      }
    });

    socket.on("NEW_EMERGENCY_REQUEST_DISPATCHED", (event) => {
      if (!event) return;
      const eventId = event.eventId;
      if (eventId && processedEventIds.has(eventId)) return;
      if (eventId) {
        processedEventIds.add(eventId);
        if (processedEventIds.size > 200) {
          const first = processedEventIds.values().next().value;
          processedEventIds.delete(first);
        }
      }

      const hospitalId = event.hospitalId;
      const sub = activeHospitalSubscriptions.get(hospitalId);
      if (sub && sub.callbacks) {
        sub.callbacks.forEach((cb) => {
          try {
            cb({ type: "NEW_REQUEST", ...event });
          } catch (e) {
            console.error("Error executing new request dispatched callback:", e);
          }
        });
      }
    });
  }

  return socket;
}

/**
 * Subscribe to patient emergency request real-time status updates
 * Restricted to the given requestId
 */
export function subscribeToPatientStatus(requestId, onUpdate) {
  if (!requestId || typeof onUpdate !== "function") return () => {};

  const s = getSocket();
  const rid = String(requestId).trim();

  if (!activePatientSubscriptions.has(rid)) {
    activePatientSubscriptions.set(rid, new Set());
    if (s.connected) {
      s.emit("join_patient_request", { requestId: rid });
    }
  }

  activePatientSubscriptions.get(rid).add(onUpdate);

  // Return unsubscribe cleanup function
  return () => {
    const subs = activePatientSubscriptions.get(rid);
    if (subs) {
      subs.delete(onUpdate);
      if (subs.size === 0) {
        activePatientSubscriptions.delete(rid);
        if (s.connected) {
          s.emit("leave_patient_request", { requestId: rid });
        }
      }
    }
  };
}

/**
 * Subscribe to authenticated hospital emergency desk real-time updates
 * Requires valid JWT Bearer token
 */
export function subscribeToHospitalDesk(hospitalId, token, onUpdate) {
  if (!hospitalId || !token || typeof onUpdate !== "function") return () => {};

  const s = getSocket();
  const hid = String(hospitalId).trim();

  if (!activeHospitalSubscriptions.has(hid)) {
    activeHospitalSubscriptions.set(hid, {
      token,
      callbacks: new Set()
    });
    if (s.connected) {
      s.emit("join_hospital_desk", { hospitalId: hid, token });
    }
  }

  activeHospitalSubscriptions.get(hid).callbacks.add(onUpdate);

  // Return unsubscribe cleanup function
  return () => {
    const sub = activeHospitalSubscriptions.get(hid);
    if (sub) {
      sub.callbacks.delete(onUpdate);
      if (sub.callbacks.size === 0) {
        activeHospitalSubscriptions.delete(hid);
        if (s.connected) {
          s.emit("leave_hospital_desk", { hospitalId: hid });
        }
      }
    }
  };
}

export default {
  getSocket,
  subscribeToPatientStatus,
  subscribeToHospitalDesk
};
