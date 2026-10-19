import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CheckCircle2, Info } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import HospitalSidebar from "./HospitalSidebar";
import HospitalHeader from "./HospitalHeader";

export default function HospitalLayout() {
  const { isAuthenticated, toastMessage, isBackendConnected, hospital } = useHospitalPortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated in demo mode, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/hospital-portal/login" replace />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      {/* Sidebar */}
      <HospitalSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Live Sync Banner for Hospital Portal */}
        <div
          style={{
            backgroundColor: isBackendConnected ? "#ecfdf5" : "#fffbeb",
            borderBottom: `1px solid ${isBackendConnected ? "#a7f3d0" : "#fef08a"}`,
            color: isBackendConnected ? "#065f46" : "#92400e",
            padding: "0.5rem 1.25rem",
            fontSize: "0.82rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                backgroundColor: isBackendConnected ? "#059669" : "#b45309",
                color: "#ffffff",
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "0.1rem 0.45rem",
                borderRadius: "3px",
                letterSpacing: "0.04em"
              }}
            >
              {isBackendConnected ? "LIVE CONNECTED" : "DEMO HOSPITAL PORTAL"}
            </span>
            <span>
              {isBackendConnected
                ? `Real-time synchronization active with CareLink Express API & MongoDB for ${hospital?.name || "Hospital Desk"}.`
                : "Availability changes are stored in local storage cache (Offline mode)."}
            </span>
          </div>

          <span style={{ fontSize: "0.75rem", color: isBackendConnected ? "#047857" : "#b45309" }}>
            {isBackendConnected ? "Emergency Network Synchronized" : "Frontend Operations MVP"}
          </span>
        </div>

        {/* Portal Header */}
        <HospitalHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Page Outlet */}
        <main style={{ flex: 1, padding: "1.75rem", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
          <Outlet />
        </main>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "1.5rem",
              right: "1.5rem",
              zIndex: 9999,
              backgroundColor: "var(--brand-navy)",
              color: "#ffffff",
              padding: "0.85rem 1.25rem",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              animation: "fadeIn 0.2s ease"
            }}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 size={18} color="#4ade80" />
            ) : (
              <Info size={18} color="#38bdf8" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
