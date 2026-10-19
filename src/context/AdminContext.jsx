import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import adminApi, {
  getAdminToken,
  getStoredAdmin,
  removeAdminToken,
  setStoredAdmin
} from "../services/adminApi";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [token, setToken] = useState(() => getAdminToken());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const logout = useCallback(() => {
    removeAdminToken();
    setAdmin(null);
    setToken(null);
  }, []);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAdminToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await adminApi.getProfile();
        if (res.success && res.data?.role === "admin") {
          setAdmin(res.data);
          setStoredAdmin(res.data);
        } else {
          logout();
        }
      } catch (err) {
        // If 401/403, logout
        if (err.status === 401 || err.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await adminApi.login(email, password);
      if (res.success && res.data?.token) {
        setToken(res.data.token);
        setAdmin(res.data.admin);
        showToast("Welcome back, Administrator!", "success");
        return { success: true };
      }
      return { success: false, error: res.message || "Authentication failed" };
    } catch (err) {
      const msg = err.data?.message || err.message || "Failed to log in as administrator";
      return { success: false, error: msg };
    }
  };

  const isAuthenticated = Boolean(token && admin && admin.role === "admin");

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        toast,
        showToast
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

export default AdminContext;
