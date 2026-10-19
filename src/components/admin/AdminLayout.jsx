import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAdmin } from "../../context/AdminContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useAdmin();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Toast Notification Container */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1.25rem",
            right: "1.25rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.75rem 1.1rem",
            borderRadius: "8px",
            backgroundColor:
              toast.type === "error"
                ? "#fef2f2"
                : toast.type === "info"
                ? "#eff6ff"
                : "#f0fdf4",
            border: `1px solid ${
              toast.type === "error"
                ? "#fca5a5"
                : toast.type === "info"
                ? "#93c5fd"
                : "#86efac"
            }`,
            color:
              toast.type === "error"
                ? "#991b1b"
                : toast.type === "info"
                ? "#1e40af"
                : "#166534",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            fontSize: "0.85rem",
            fontWeight: 500,
            animation: "slideIn 0.2s ease"
          }}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} />
          ) : toast.type === "info" ? (
            <Info size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader onOpenMobile={() => setMobileOpen(true)} />
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .admin-mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .admin-mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
