import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-page)",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#dc2626",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500 }}>
          Authenticating administrator access...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
