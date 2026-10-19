/**
 * CareLink Emergency - Frontend API Client Service (Part 3)
 *
 * Communicates with the Express REST API server at VITE_API_URL (default: http://localhost:5000/api).
 * Automatically injects JWT Bearer token from localStorage for protected hospital portal operations.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "carelink_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn("Could not save token to localStorage:", e);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn("Could not remove token from localStorage:", e);
  }
};

/**
 * Core HTTP Request Wrapper
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP error ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ========================================================
   AUTHENTICATION APIS
   ======================================================== */

export const login = async (email, password) => {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if (result?.data?.token) {
    setToken(result.data.token);
  }
  return result;
};

export const getMe = async () => {
  return await apiRequest("/auth/me");
};

export const checkHealth = async () => {
  return await apiRequest("/auth/health");
};

/* ========================================================
   HOSPITAL APIS (Public & Protected)
   ======================================================== */

export const getHospitals = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.city) searchParams.append("city", params.city);
  if (params.search) searchParams.append("search", params.search);
  if (params.readinessStatus) searchParams.append("readinessStatus", params.readinessStatus);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return await apiRequest(`/hospitals${query}`);
};

export const getHospital = async (id) => {
  return await apiRequest(`/hospitals/${id}`);
};

export const createHospital = async (hospitalData) => {
  return await apiRequest("/hospitals", {
    method: "POST",
    body: JSON.stringify(hospitalData)
  });
};

export const updateHospital = async (id, hospitalData) => {
  return await apiRequest(`/hospitals/${id}`, {
    method: "PUT",
    body: JSON.stringify(hospitalData)
  });
};

export const deleteHospital = async (id) => {
  return await apiRequest(`/hospitals/${id}`, {
    method: "DELETE"
  });
};

/* ========================================================
   AVAILABILITY APIS
   ======================================================== */

export const getAvailability = async (hospitalId) => {
  return await apiRequest(`/hospitals/${hospitalId}/availability`);
};

export const updateAvailability = async (hospitalId, availabilityData) => {
  return await apiRequest(`/hospitals/${hospitalId}/availability`, {
    method: "PUT",
    body: JSON.stringify(availabilityData)
  });
};

/* ========================================================
   DOCTOR / SPECIALIST APIS
   ======================================================== */

export const getDoctors = async (hospitalId) => {
  return await apiRequest(`/hospitals/${hospitalId}/doctors`);
};

export const addDoctor = async (hospitalId, doctorData) => {
  return await apiRequest(`/hospitals/${hospitalId}/doctors`, {
    method: "POST",
    body: JSON.stringify(doctorData)
  });
};

export const updateDoctor = async (id, doctorData) => {
  return await apiRequest(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(doctorData)
  });
};

export const deleteDoctor = async (id) => {
  return await apiRequest(`/doctors/${id}`, {
    method: "DELETE"
  });
};

/* ========================================================
   FACILITY APIS
   ======================================================== */

export const getFacilities = async (hospitalId) => {
  return await apiRequest(`/hospitals/${hospitalId}/facilities`);
};

export const updateFacilities = async (hospitalId, facilityData) => {
  return await apiRequest(`/hospitals/${hospitalId}/facilities`, {
    method: "PUT",
    body: JSON.stringify(facilityData)
  });
};

/* ========================================================
   COST & INSURANCE APIS
   ======================================================== */

export const getCosts = async (hospitalId) => {
  return await apiRequest(`/hospitals/${hospitalId}/costs`);
};

export const updateCosts = async (hospitalId, costData) => {
  return await apiRequest(`/hospitals/${hospitalId}/costs`, {
    method: "PUT",
    body: JSON.stringify(costData)
  });
};

/* ========================================================
   EMERGENCY REQUEST APIS
   ======================================================== */

export const createEmergencyRequest = async (requestData) => {
  return await apiRequest("/emergency-requests", {
    method: "POST",
    body: JSON.stringify(requestData)
  });
};

export const getEmergencyRequest = async (id) => {
  return await apiRequest(`/emergency-requests/${id}`);
};

export const getEmergencyRequests = async (hospitalId, params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append("status", params.status);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return await apiRequest(`/hospitals/${hospitalId}/emergency-requests${query}`);
};

export const reviewEmergencyRequest = async (requestId, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/review`, {
    method: "PUT",
    body: JSON.stringify({ note })
  });
};

export const acceptEmergencyRequest = async (requestId, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/accept`, {
    method: "PUT",
    body: JSON.stringify({ note })
  });
};

export const rejectEmergencyRequest = async (requestId, rejectionReason, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectionReason, note })
  });
};

export const completeEmergencyRequest = async (requestId, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/complete`, {
    method: "PUT",
    body: JSON.stringify({ note })
  });
};

/* ========================================================
   PART 4B: MULTI-HOSPITAL DISPATCH & RESPONSE APIS
   ======================================================== */

export const dispatchEmergencyRequest = async (requestId, hospitalIds) => {
  return await apiRequest(`/emergency-requests/${requestId}/dispatch`, {
    method: "POST",
    body: JSON.stringify({ hospitalIds })
  });
};

export const getEmergencyResponses = async (requestId) => {
  return await apiRequest(`/emergency-requests/${requestId}/responses`);
};

export const reviewHospitalEmergencyResponse = async (requestId, hospitalId, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/hospitals/${hospitalId}/review`, {
    method: "PUT",
    body: JSON.stringify({ note })
  });
};

export const acceptHospitalEmergencyResponse = async (requestId, hospitalId, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/hospitals/${hospitalId}/accept`, {
    method: "PUT",
    body: JSON.stringify({ note })
  });
};

export const rejectHospitalEmergencyResponse = async (requestId, hospitalId, rejectionReason, note) => {
  return await apiRequest(`/emergency-requests/${requestId}/hospitals/${hospitalId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectionReason, note })
  });
};

export default {
  getToken,
  setToken,
  removeToken,
  login,
  getMe,
  checkHealth,
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getAvailability,
  updateAvailability,
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getFacilities,
  updateFacilities,
  getCosts,
  updateCosts,
  createEmergencyRequest,
  getEmergencyRequest,
  getEmergencyRequests,
  reviewEmergencyRequest,
  acceptEmergencyRequest,
  rejectEmergencyRequest,
  completeEmergencyRequest,
  dispatchEmergencyRequest,
  getEmergencyResponses,
  reviewHospitalEmergencyResponse,
  acceptHospitalEmergencyResponse,
  rejectHospitalEmergencyResponse
};
