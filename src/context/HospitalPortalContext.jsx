import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { INITIAL_HOSPITAL_DATA } from "../data/hospitalPortalData";
import api, { getToken, removeToken } from "../services/api";
import { subscribeToHospitalDesk } from "../services/socket";
import { getLocationInfo } from "../utils/locationHelper";

const HospitalPortalContext = createContext(null);

const STORAGE_KEY = "carelink_hospital_data_v2";
const AUTH_KEY = "carelink_hospital_auth_v2";
const DEFAULT_HOSPITAL_ID = "670100000000000000000010"; // Care Hospital Pune MongoDB ID

/**
 * Calculates availability status:
 * If available > 30% of total: "Available"
 * If available > 0 and <= 30%: "Limited"
 * If available === 0: "Full" / "Unavailable"
 */
export function calculateAvailabilityStatus(available, total) {
  if (total <= 0 || available <= 0) {
    return {
      status: "unavailable",
      label: "Full / Unavailable",
      badgeClass: "badge-unavailable",
      dotClass: "unavailable",
      icon: "🔴"
    };
  }
  const ratio = available / total;
  if (ratio > 0.3) {
    return {
      status: "available",
      label: "Available",
      badgeClass: "badge-available",
      dotClass: "available",
      icon: "🟢"
    };
  }
  return {
    status: "limited",
    label: "Limited",
    badgeClass: "badge-limited",
    dotClass: "limited",
    icon: "🟡"
  };
}

// Helper to map backend status to UI status
function mapBackendStatusToUI(status) {
  if (!status) return "On Duty";
  const s = String(status).toUpperCase();
  if (s === "ON_DUTY" || s === "AVAILABLE") return "On Duty";
  if (s === "ON_CALL" || s === "LIMITED") return "On Call";
  return "Unavailable";
}

// Helper to map UI status to backend status
function mapUIStatusToBackend(status) {
  if (!status) return "ON_DUTY";
  if (status === "On Duty") return "ON_DUTY";
  if (status === "On Call") return "ON_CALL";
  return "UNAVAILABLE";
}

// Helper to map backend emergency request to UI model
function mapBackendEmergencyRequest(r, idx) {
  let uiStatus = "Pending";
  const s = String(r.status || r.rawStatus || "").toUpperCase();
  if (s === "ACCEPTED") uiStatus = "Accepted";
  else if (s === "REJECTED") uiStatus = "Cannot Accept";
  else if (s === "UNDER_REVIEW") uiStatus = "Under Review";
  else if (s === "COMPLETED") uiStatus = "Completed";
  else if (s === "NEW" || s === "PENDING") {
    uiStatus = idx === 0 ? "New" : "Pending";
  }

  const reqId = r.id || r._id || `ER-${1020 + idx}`;
  return {
    id: reqId,
    _id: r._id,
    status: uiStatus,
    rawStatus: r.status || "PENDING",
    patient: r.patientName
      ? `${r.patientName} (${r.patientGender || "Unspecified"}, ${r.patientAge || ""} yrs)`
      : `Case #${idx + 1}`,
    patientName: r.patientName,
    patientAge: r.patientAge,
    patientGender: r.patientGender,
    emergencyType: r.emergencyType || "Emergency Case",
    reportedComplaint: r.reportedComplaint || null,
    suggestedSpecialist: r.suggestedSpecialist || null,
    requiredSpecialist: r.requiredSpecialist || null,
    symptoms: r.message || "",
    requiredFacilities: (() => {
      const facs = Array.isArray(r.requiredFacility) ? [...r.requiredFacility] : [];
      if (r.requiredSpecialist && !facs.includes(r.requiredSpecialist)) {
        facs.push(r.requiredSpecialist);
      }
      return facs.length > 0 ? facs : ["Emergency Care"];
    })(),
    location: r.location ?? null,
    locationInfo: getLocationInfo(r.location),
    estimatedArrival: r.estimatedArrival || "15 min",
    receivedTime: r.createdAt
      ? new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Recently",
    timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - idx * 60 * 1000,
    budget: r.budget || "",
    insurance: r.insurance || "",
    contactPhone: r.contactPhone || "",
    statusNote: r.rejectionReason || null,
    responseNote: r.responseNote || r.hospitalResponse?.note || null,
    hospitalResponse: r.hospitalResponse || null
  };
}

export function HospitalPortalProvider({ children }) {
  // Load initial fallback from localStorage or INITIAL_HOSPITAL_DATA
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load hospital data from localStorage:", e);
    }
    return INITIAL_HOSPITAL_DATA;
  });

  // Auth state: Require an actual JWT token from storage/api.js, not flag alone
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = getToken();
      return Boolean(token);
    } catch {
      return false;
    }
  });

  const [activeHospitalId, setActiveHospitalId] = useState(() => {
    try {
      const savedId = localStorage.getItem("carelink_active_hospital_id");
      if (savedId && /^[0-9a-fA-F]{24}$/.test(savedId)) return savedId;
    } catch {}
    return data.hospital?.id && data.hospital.id.startsWith("670")
      ? data.hospital.id
      : DEFAULT_HOSPITAL_ID;
  });

  // Sync activeHospitalId to localStorage
  useEffect(() => {
    if (activeHospitalId && /^[0-9a-fA-F]{24}$/.test(activeHospitalId)) {
      try {
        localStorage.setItem("carelink_active_hospital_id", activeHospitalId);
      } catch {}
    }
  }, [activeHospitalId]);

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Show transient toast notification
  const showToast = useCallback((message, type = "success") => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Sync data to localStorage as emergency cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to persist hospital data to localStorage:", e);
    }
  }, [data]);

  // Sync auth state
  useEffect(() => {
    try {
      const token = getToken();
      if (isAuthenticated && token) {
        localStorage.setItem(AUTH_KEY, "true");
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist hospital auth to localStorage:", e);
    }
  }, [isAuthenticated]);

  // Load all hospital datasets from Backend REST API
  const loadHospitalDataFromBackend = useCallback(async (hospitalId = activeHospitalId) => {
    setIsLoading(true);
    setBackendError(null);

    try {
      // 1. Fetch Hospital Info
      const hospRes = await api.getHospital(hospitalId).catch(() => null);

      // 2. Fetch Availability
      const availRes = await api.getAvailability(hospitalId).catch(() => null);

      // 3. Fetch Doctors
      const docRes = await api.getDoctors(hospitalId).catch(() => null);

      // 4. Fetch Facilities
      const facRes = await api.getFacilities(hospitalId).catch(() => null);

      // 5. Fetch Costs & Insurance
      const costRes = await api.getCosts(hospitalId).catch(() => null);

      // 6. Fetch Emergency Requests
      let reqRes = null;
      try {
        if (getToken()) {
          reqRes = await api.getEmergencyRequests(hospitalId);
        }
      } catch (err) {
        if (err?.status === 401) {
          removeToken();
          setIsAuthenticated(false);
          setBackendError("Session expired or unauthorized. Please sign in again.");
        } else {
          console.warn("Failed to load emergency requests:", err.message);
        }
      }

      if (hospRes?.data || availRes?.data) {
        setIsBackendConnected(true);

        setData((prev) => {
          const hospData = hospRes?.data || {};
          const avail = availRes?.data || hospData.availability || {};
          const doctorsList = docRes?.data || hospData.doctors || [];
          const facilitiesObj = facRes?.data || hospData.facilities || {};
          const costsObj = costRes?.data || hospData.costs || {};
          const reqsList = reqRes?.data || [];

          // Map bed availability
          const normal = avail.normalBeds || {};
          const icu = avail.icuBeds || {};
          const vent = avail.ventilators || {};
          const emg = avail.emergencyBeds || {};

          const updatedBeds = {
            general: {
              total: Number(normal.total ?? prev.beds.general.total),
              occupied: Number(normal.occupied ?? prev.beds.general.occupied)
            },
            icu: {
              total: Number(icu.total ?? prev.beds.icu.total),
              occupied: Number(icu.occupied ?? prev.beds.icu.occupied)
            },
            ventilators: {
              total: Number(vent.total ?? prev.beds.ventilators.total),
              occupied: Number(vent.occupied ?? prev.beds.ventilators.occupied)
            },
            emergency: {
              total: Number(emg.total ?? prev.beds.emergency.total),
              occupied: Number(emg.occupied ?? prev.beds.emergency.occupied)
            }
          };

          // Map doctors
          const mappedDoctors = doctorsList.map((d, index) => ({
            id: d._id || d.id || `doc-${index + 1}`,
            _id: d._id,
            name: d.name,
            specialty: d.specialization || d.specialty || "Specialist",
            specialization: d.specialization || d.specialty || "Specialist",
            department: d.department || "",
            qualification: d.qualification || "",
            experience: d.experience || "",
            status: mapBackendStatusToUI(d.status),
            onCall: d.status === "ON_CALL" || d.status === "On Call",
            workingHours: d.workingHours || "8 AM – 8 PM",
            phone: d.phone || ""
          }));

          // Map facilities
          const mappedFacilities = prev.facilities.map((fac) => {
            let key = null;
            if (fac.name.includes("Emergency")) key = "emergency";
            else if (fac.name.includes("ICU")) key = "icu";
            else if (fac.name.includes("Ventilator")) key = "ventilator";
            else if (fac.name.includes("Operation Theatre")) key = "operationTheatre";
            else if (fac.name.includes("Blood Bank")) key = "bloodBank";
            else if (fac.name.includes("CT Scan")) key = "ctScan";
            else if (fac.name.includes("MRI")) key = "mri";
            else if (fac.name.includes("Pharmacy")) key = "pharmacy";
            else if (fac.name.includes("Ambulance")) key = "ambulance";
            else if (fac.name.includes("Dialysis")) key = "dialysis";
            else if (fac.name.includes("NICU")) key = "nicu";
            else if (fac.name.includes("PICU")) key = "picu";

            if (key && facilitiesObj[key]) {
              return {
                ...fac,
                status: facilitiesObj[key].status || (facilitiesObj[key].available ? "Available" : "Unavailable"),
                details: facilitiesObj[key].details || fac.details
              };
            }
            return fac;
          });

          // Map costs
          const updatedCosts = {
            generalBed: costsObj.normalBedPerDay ?? prev.costs.generalBed,
            icu: costsObj.icuPerDay ?? prev.costs.icu,
            ventilator: costsObj.ventilatorPerDay ?? prev.costs.ventilator,
            emergencyConsultation: costsObj.emergencyVisit ?? prev.costs.emergencyConsultation,
            specialistConsultation: costsObj.consultation ?? prev.costs.specialistConsultation,
            operationTheatre: costsObj.surgeryStarting ?? prev.costs.operationTheatre,
            minEstimatedCost: costsObj.minEstimatedCost ?? prev.costs.minEstimatedCost,
            maxEstimatedCost: costsObj.maxEstimatedCost ?? prev.costs.maxEstimatedCost
          };

          // Map emergency requests
          const mappedRequests = Array.isArray(reqsList)
            ? reqsList.map((r, idx) => mapBackendEmergencyRequest(r, idx))
            : [];

          return {
            ...prev,
            hospital: {
              ...prev.hospital,
              id: hospData._id || hospData.id || prev.hospital.id,
              name: hospData.name || prev.hospital.name,
              address: hospData.address || prev.hospital.address,
              city: hospData.city || prev.hospital.city,
              phone: hospData.phone || prev.hospital.phone,
              emergencyPhone: hospData.emergencyPhone || prev.hospital.emergencyPhone,
              status: hospData.readinessStatus || prev.hospital.status || "ACTIVE",
              lastUpdated: hospData.lastVerified || "Just now"
            },
            beds: updatedBeds,
            doctors: mappedDoctors.length > 0 ? mappedDoctors : prev.doctors,
            facilities: mappedFacilities,
            costs: updatedCosts,
            insurance: costsObj.insuranceAccepted || prev.insurance,
            emergencyRequests: Array.isArray(reqRes?.data) ? mappedRequests : prev.emergencyRequests
          };
        });
      } else {
        setIsBackendConnected(false);
        setBackendError("Backend unavailable — showing demo data");
      }
    } catch (err) {
      console.warn("Backend load error:", err.message);
      setIsBackendConnected(false);
      setBackendError("Backend unavailable — showing demo data");
    } finally {
      setIsLoading(false);
    }
  }, [activeHospitalId]);

  // Load backend data on mount or when active hospital changes
  useEffect(() => {
    loadHospitalDataFromBackend(activeHospitalId);
  }, [loadHospitalDataFromBackend, activeHospitalId]);

  // In-flight guard to prevent overlapping background poll requests
  const isRefreshingRequestsRef = React.useRef(false);

  // Background refresh specifically for incoming emergency requests
  const refreshEmergencyRequests = useCallback(async (hospitalId = activeHospitalId) => {
    if (isRefreshingRequestsRef.current) return;
    const token = getToken();
    if (!token) return;

    isRefreshingRequestsRef.current = true;
    try {
      const res = await api.getEmergencyRequests(hospitalId);
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((r, idx) => mapBackendEmergencyRequest(r, idx));
        setData((prev) => ({
          ...prev,
          emergencyRequests: mapped
        }));
        setIsBackendConnected(true);
      }
    } catch (err) {
      if (err?.status === 401) {
        removeToken();
        setIsAuthenticated(false);
        setBackendError("Session expired or unauthorized. Please sign in again.");
      } else {
        console.warn("Emergency requests background poll failed:", err.message);
      }
    } finally {
      isRefreshingRequestsRef.current = false;
    }
  }, [activeHospitalId]);

  // Automatic hospital request refresh approximately every 5 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token) return;

    const intervalId = setInterval(() => {
      refreshEmergencyRequests(activeHospitalId);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, activeHospitalId, refreshEmergencyRequests]);

  // Phase C: Real-Time Socket.IO Subscription for authenticated hospital desk
  useEffect(() => {
    if (!isAuthenticated || !activeHospitalId) return;
    const token = getToken();
    if (!token) return;

    const unsubscribe = subscribeToHospitalDesk(activeHospitalId, token, (event) => {
      if (event.type === "NEW_REQUEST") {
        showToast(`🚨 New incoming emergency request #${event.id || event.requestId || ""} dispatched to your desk!`, "warning");
        refreshEmergencyRequests(activeHospitalId);
      } else if (event.type === "REQUEST_UPDATED") {
        refreshEmergencyRequests(activeHospitalId);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, activeHospitalId, refreshEmergencyRequests, showToast]);

  // Touch last updated
  const touchLastUpdated = () => ({
    lastUpdated: "Just now",
    lastUpdatedTimestamp: Date.now()
  });

  // 1. HOSPITAL LOGIN
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const res = await api.login(email, password);

      if (res?.success && res?.data?.token) {
        setIsAuthenticated(true);
        setIsBackendConnected(true);
        setBackendError(null);

        const hospitalId = res.data?.hospital?.id || DEFAULT_HOSPITAL_ID;
        setActiveHospitalId(hospitalId);
        showToast(`Signed in to ${res.data?.hospital?.name || "Hospital Operations Desk"}`);

        // Load fresh backend data
        await loadHospitalDataFromBackend(hospitalId);
        return { success: true };
      } else {
        return { success: false, error: res?.message || "Invalid credentials" };
      }
    } catch (err) {
      console.warn("Login failed with backend error:", err.message);
      return { success: false, error: err?.data?.message || err.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const switchHospital = async (targetHospitalId) => {
    if (!targetHospitalId) return;

    const targetIdStr = String(targetHospitalId);
    try {
      localStorage.setItem("carelink_active_hospital_id", targetIdStr);
    } catch {}

    setActiveHospitalId(targetIdStr);
    return await loadHospitalDataFromBackend(targetIdStr);
  };

  const logout = () => {
    removeToken();
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.warn("Failed to remove auth key:", e);
    }
    setIsAuthenticated(false);
    showToast("Signed out of Hospital Portal", "info");
  };

  // 2. AVAILABILITY UPDATE
  const updateBeds = async (updatedBeds, otData, bloodBankData) => {
    const payload = {
      normalBeds: {
        total: Number(updatedBeds.general.total),
        occupied: Number(updatedBeds.general.occupied)
      },
      icuBeds: {
        total: Number(updatedBeds.icu.total),
        occupied: Number(updatedBeds.icu.occupied)
      },
      ventilators: {
        total: Number(updatedBeds.ventilators.total),
        occupied: Number(updatedBeds.ventilators.occupied)
      },
      emergencyBeds: {
        total: Number(updatedBeds.emergency.total),
        occupied: Number(updatedBeds.emergency.occupied)
      }
    };

    // Optimistic local update
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      beds: {
        general: { total: payload.normalBeds.total, occupied: payload.normalBeds.occupied },
        icu: { total: payload.icuBeds.total, occupied: payload.icuBeds.occupied },
        ventilators: { total: payload.ventilators.total, occupied: payload.ventilators.occupied },
        emergency: { total: payload.emergencyBeds.total, occupied: payload.emergencyBeds.occupied }
      },
      operationTheatre: otData ? { ...otData } : prev.operationTheatre,
      bloodBank: bloodBankData ? { ...bloodBankData } : prev.bloodBank
    }));

    try {
      const res = await api.updateAvailability(activeHospitalId, payload);
      if (res?.success) {
        showToast("Availability updated & saved to backend.");
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn("Backend updateAvailability failed:", err.message);
      showToast("Availability saved locally (Backend unavailable — showing demo data)", "warning");
      setIsBackendConnected(false);
      setBackendError("Backend unavailable — showing demo data");
    }
  };

  // 3. DOCTORS MANAGEMENT
  const addDoctor = async (doctor) => {
    const backendDocData = {
      name: doctor.name,
      specialization: doctor.specialty || doctor.specialization,
      department: doctor.department || `${doctor.specialty || "Emergency"} Care`,
      qualification: doctor.qualification || "MBBS",
      experience: doctor.experience || "5 years",
      status: mapUIStatusToBackend(doctor.status),
      workingHours: doctor.workingHours || "8 AM – 8 PM",
      phone: doctor.phone || ""
    };

    // Optimistic update
    const tempId = `doc-${Date.now()}`;
    const newDoc = {
      ...doctor,
      id: tempId,
      specialization: doctor.specialty || doctor.specialization
    };

    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      doctors: [newDoc, ...prev.doctors]
    }));

    try {
      const res = await api.addDoctor(activeHospitalId, backendDocData);
      if (res?.success && res.data) {
        // Replace tempId with backend MongoDB _id
        setData((prev) => ({
          ...prev,
          doctors: prev.doctors.map((d) =>
            d.id === tempId ? { ...d, id: res.data._id, _id: res.data._id } : d
          )
        }));
        showToast(`Dr. ${doctor.name} added to roster.`);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn("Backend addDoctor failed:", err.message);
      showToast(`Dr. ${doctor.name} saved locally (Offline mode)`, "warning");
    }
  };

  const updateDoctor = async (id, updatedFields) => {
    // Optimistic update
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      doctors: prev.doctors.map((doc) =>
        doc.id === id || doc._id === id ? { ...doc, ...updatedFields } : doc
      )
    }));

    try {
      const payload = { ...updatedFields };
      if (payload.status) {
        payload.status = mapUIStatusToBackend(payload.status);
      }
      if (payload.specialty) {
        payload.specialization = payload.specialty;
      }
      await api.updateDoctor(id, payload);
      showToast("Specialist details updated.");
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend updateDoctor failed:", err.message);
      showToast("Updated locally (Backend unavailable)", "warning");
    }
  };

  const toggleDoctorAvailability = async (id) => {
    const target = data.doctors.find((d) => d.id === id || d._id === id);
    if (!target) return;

    let nextStatus = "On Duty";
    let nextOnCall = target.onCall;

    if (target.status === "On Duty") {
      nextStatus = "On Call";
      nextOnCall = true;
    } else if (target.status === "On Call") {
      nextStatus = "Unavailable";
      nextOnCall = false;
    } else {
      nextStatus = "On Duty";
      nextOnCall = true;
    }

    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      doctors: prev.doctors.map((doc) =>
        doc.id === id || doc._id === id
          ? { ...doc, status: nextStatus, onCall: nextOnCall }
          : doc
      )
    }));

    try {
      await api.updateDoctor(id, {
        status: mapUIStatusToBackend(nextStatus)
      });
      showToast("Doctor status updated on server.");
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend toggleDoctorAvailability failed:", err.message);
      showToast("Status updated locally", "warning");
    }
  };

  const deleteDoctor = async (id) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      doctors: prev.doctors.filter((d) => d.id !== id && d._id !== id)
    }));

    try {
      await api.deleteDoctor(id);
      showToast("Specialist removed from roster.", "info");
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend deleteDoctor failed:", err.message);
      showToast("Removed locally", "warning");
    }
  };

  // 4. FACILITY MANAGEMENT
  const updateFacility = async (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      facilities: prev.facilities.map((fac) =>
        fac.id === id ? { ...fac, ...updatedFields } : fac
      )
    }));

    try {
      // Map UI id to backend facility key
      const keyMap = {
        "fac-1": "emergency",
        "fac-2": "icu",
        "fac-3": "ventilator",
        "fac-4": "operationTheatre",
        "fac-5": "bloodBank",
        "fac-6": "ctScan",
        "fac-7": "mri",
        "fac-8": "pharmacy",
        "fac-9": "ambulance",
        "fac-10": "dialysis",
        "fac-11": "nicu",
        "fac-12": "picu"
      };

      const key = keyMap[id];
      if (key) {
        const payload = {
          [key]: {
            available: updatedFields.status !== "Unavailable",
            status: updatedFields.status,
            details: updatedFields.details || ""
          }
        };
        await api.updateFacilities(activeHospitalId, payload);
        showToast("Facility status saved to backend.");
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn("Backend updateFacilities failed:", err.message);
      showToast("Facility updated locally", "warning");
    }
  };

  // 5. COSTS & INSURANCE MANAGEMENT
  const updateCostsAndInsurance = async (costsData, insuranceList) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      costs: { ...prev.costs, ...costsData },
      insurance: insuranceList || prev.insurance
    }));

    try {
      const payload = {
        normalBedPerDay: costsData.generalBed,
        icuPerDay: costsData.icu,
        ventilatorPerDay: costsData.ventilator,
        emergencyVisit: costsData.emergencyConsultation,
        consultation: costsData.specialistConsultation,
        surgeryStarting: costsData.operationTheatre,
        minEstimatedCost: costsData.minEstimatedCost,
        maxEstimatedCost: costsData.maxEstimatedCost,
        insuranceAccepted: insuranceList || data.insurance
      };

      await api.updateCosts(activeHospitalId, payload);
      showToast("Hospital costs & insurance saved to backend.");
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend updateCosts failed:", err.message);
      showToast("Costs saved locally (Backend unavailable)", "warning");
    }
  };

  // 6. EMERGENCY REQUESTS (HOSPITAL SIDE: REVIEW, ACCEPT, REJECT, COMPLETE)
  const reviewEmergencyRequest = async (requestId, note) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      emergencyRequests: prev.emergencyRequests.map((req) => {
        if (req.id === requestId || req._id === requestId) {
          return {
            ...req,
            status: "Under Review",
            rawStatus: "UNDER_REVIEW",
            statusNote: note || "Hospital casualty desk is actively reviewing triage request.",
            responseNote: note || null
          };
        }
        return req;
      })
    }));

    try {
      let res;
      try {
        res = await api.reviewHospitalEmergencyResponse(requestId, activeHospitalId, note);
      } catch {
        res = await api.reviewEmergencyRequest(requestId, note);
      }
      if (res?.success) {
        showToast(`Emergency Case #${requestId} marked as Under Review.`);
        setIsBackendConnected(true);
        refreshEmergencyRequests(activeHospitalId);
      }
    } catch (err) {
      console.warn("Backend reviewEmergencyRequest failed:", err.message);
      showToast(`Case #${requestId} marked Under Review locally`, "info");
    }
  };

  const acceptEmergencyRequest = async (requestId, note) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      emergencyRequests: prev.emergencyRequests.map((req) => {
        if (req.id === requestId || req._id === requestId) {
          return {
            ...req,
            status: "Accepted",
            rawStatus: "ACCEPTED",
            statusNote: note || "Hospital Confirmed",
            responseNote: note || null,
            confirmedAt: "Just now"
          };
        }
        return req;
      })
    }));

    try {
      let res;
      try {
        res = await api.acceptHospitalEmergencyResponse(requestId, activeHospitalId, note);
      } catch {
        res = await api.acceptEmergencyRequest(requestId, note);
      }
      if (res?.success) {
        showToast(`Emergency Case #${requestId} confirmed and accepted.`);
        setIsBackendConnected(true);
        refreshEmergencyRequests(activeHospitalId);
      }
    } catch (err) {
      console.warn("Backend acceptEmergencyRequest failed:", err.message);
      showToast(`Case #${requestId} accepted locally`, "warning");
    }
  };

  const rejectEmergencyRequest = async (requestId, reason, note) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      emergencyRequests: prev.emergencyRequests.map((req) => {
        if (req.id === requestId || req._id === requestId) {
          return {
            ...req,
            status: "Cannot Accept",
            rawStatus: "REJECTED",
            statusNote: reason,
            responseNote: note || null,
            confirmedAt: null
          };
        }
        return req;
      })
    }));

    try {
      let res;
      try {
        res = await api.rejectHospitalEmergencyResponse(requestId, activeHospitalId, reason, note);
      } catch {
        res = await api.rejectEmergencyRequest(requestId, reason, note);
      }
      if (res?.success) {
        showToast(`Emergency Case #${requestId} marked as Cannot Accept (${reason}).`, "info");
        setIsBackendConnected(true);
        refreshEmergencyRequests(activeHospitalId);
      }
    } catch (err) {
      console.warn("Backend rejectEmergencyRequest failed:", err.message);
      showToast(`Case marked Cannot Accept locally`, "warning");
    }
  };

  const completeEmergencyRequest = async (requestId, note) => {
    setData((prev) => ({
      ...prev,
      hospital: { ...prev.hospital, ...touchLastUpdated() },
      emergencyRequests: prev.emergencyRequests.map((req) => {
        if (req.id === requestId || req._id === requestId) {
          return {
            ...req,
            status: "Completed",
            rawStatus: "COMPLETED",
            statusNote: note || "Completed",
            responseNote: note || null
          };
        }
        return req;
      })
    }));

    try {
      const res = await api.completeEmergencyRequest(requestId, note);
      if (res?.success) {
        showToast(`Emergency Case #${requestId} marked as Completed.`);
        setIsBackendConnected(true);
        refreshEmergencyRequests(activeHospitalId);
      }
    } catch (err) {
      console.warn("Backend completeEmergencyRequest failed:", err.message);
      showToast(`Case marked Completed locally`, "info");
    }
  };

  // 7. PROFILE MANAGEMENT
  const updateProfile = (profileData) => {
    setData((prev) => ({
      ...prev,
      hospital: {
        ...prev.hospital,
        ...profileData,
        ...touchLastUpdated()
      }
    }));
    showToast("Hospital profile saved successfully.");
  };

  const resetToDemoDefaults = () => {
    setData(INITIAL_HOSPITAL_DATA);
    showToast("Reset to default demo data.");
  };

  // Dynamically calculate bed availability object with total, occupied, available
  const computedBeds = {
    general: {
      total: Number(data.beds.general.total),
      occupied: Number(data.beds.general.occupied),
      available: Math.max(0, Number(data.beds.general.total) - Number(data.beds.general.occupied))
    },
    icu: {
      total: Number(data.beds.icu.total),
      occupied: Number(data.beds.icu.occupied),
      available: Math.max(0, Number(data.beds.icu.total) - Number(data.beds.icu.occupied))
    },
    ventilators: {
      total: Number(data.beds.ventilators.total),
      occupied: Number(data.beds.ventilators.occupied),
      available: Math.max(0, Number(data.beds.ventilators.total) - Number(data.beds.ventilators.occupied))
    },
    emergency: {
      total: Number(data.beds.emergency.total),
      occupied: Number(data.beds.emergency.occupied),
      available: Math.max(0, Number(data.beds.emergency.total) - Number(data.beds.emergency.occupied))
    }
  };

  const pendingRequestsCount = data.emergencyRequests.filter(
    (r) => r.status === "New" || r.status === "Pending"
  ).length;

  return (
    <HospitalPortalContext.Provider
      value={{
        hospital: data.hospital,
        beds: computedBeds,
        rawBeds: data.beds,
        operationTheatre: data.operationTheatre,
        bloodBank: data.bloodBank,
        doctors: data.doctors,
        facilities: data.facilities,
        costs: data.costs,
        insurance: data.insurance,
        emergencyRequests: data.emergencyRequests,
        notifications: data.notifications,
        pendingRequestsCount,
        isAuthenticated,
        isLoading,
        isBackendConnected,
        backendError,
        activeHospitalId,
        login,
        logout,
        switchHospital,
        updateBeds,
        addDoctor,
        updateDoctor,
        toggleDoctorAvailability,
        deleteDoctor,
        updateFacility,
        updateCostsAndInsurance,
        reviewEmergencyRequest,
        acceptEmergencyRequest,
        rejectEmergencyRequest,
        completeEmergencyRequest,
        updateProfile,
        resetToDemoDefaults,
        loadHospitalDataFromBackend,
        refreshEmergencyRequests,
        toastMessage
      }}
    >
      {children}
    </HospitalPortalContext.Provider>
  );
}

export function useHospitalPortal() {
  const context = useContext(HospitalPortalContext);
  if (!context) {
    throw new Error("useHospitalPortal must be used within a HospitalPortalProvider");
  }
  return context;
}
