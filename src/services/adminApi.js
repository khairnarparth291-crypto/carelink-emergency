/**
 * CareLink Emergency - Admin Portal API Service
 * Dedicated service for administrator actions.
 * Maintains isolated token and session management.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ADMIN_TOKEN_KEY = "carelink_admin_token";
const ADMIN_USER_KEY = "carelink_admin_user";

export const getAdminToken = () => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setAdminToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (e) {
    console.warn("Could not write admin token to storage:", e);
  }
};

export const removeAdminToken = () => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch (e) {
    console.warn("Could not clear admin storage:", e);
  }
};

export const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAdmin = (admin) => {
  try {
    if (admin) {
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ADMIN_USER_KEY);
    }
  } catch (e) {
    console.warn("Could not save admin profile to storage:", e);
  }
};

/**
 * Generic Admin Fetch Wrapper
 */
async function adminRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAdminToken();

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -------------------------------------------------------------
// Admin API Methods
// -------------------------------------------------------------

export const adminApi = {
  // Authentication
  login: async (email, password) => {
    const res = await adminRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      setAdminToken(res.data.token);
      setStoredAdmin(res.data.admin);
    }
    return res;
  },

  getProfile: async () => {
    return await adminRequest("/admin/me");
  },

  // Dashboard Aggregated Statistics
  getStats: async () => {
    return await adminRequest("/admin/stats");
  },

  // Hospital Management
  getHospitals: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.city) query.append("city", params.city);
    if (params.readinessStatus) query.append("readinessStatus", params.readinessStatus);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const qs = query.toString();
    return await adminRequest(`/admin/hospitals${qs ? `?${qs}` : ""}`);
  },

  getHospitalById: async (id) => {
    return await adminRequest(`/admin/hospitals/${id}`);
  },

  updateHospitalStatus: async (id, isActive, reason = "") => {
    return await adminRequest(`/admin/hospitals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive, reason })
    });
  },

  // Emergency Requests (Read-Only)
  getEmergencies: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params.dateTo) query.append("dateTo", params.dateTo);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const qs = query.toString();
    return await adminRequest(`/admin/emergencies${qs ? `?${qs}` : ""}`);
  },

  getEmergencyById: async (id) => {
    return await adminRequest(`/admin/emergencies/${id}`);
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.action) query.append("action", params.action);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const qs = query.toString();
    return await adminRequest(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
  }
};

export default adminApi;
