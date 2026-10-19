import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  Users2,
  Building2,
  DollarSign,
  Siren,
  Hospital,
  LogOut,
  X,
  ExternalLink,
  RotateCcw,
  Activity
} from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";

export default function HospitalSidebar({ mobileOpen, onCloseMobile }) {
  const { hospital, pendingRequestsCount, logout, resetToDemoDefaults } = useHospitalPortal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/hospital-portal/login");
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      to: "/hospital-portal",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true
    },
    {
      to: "/hospital-portal/availability",
      label: "Availability & Beds",
      icon: BedDouble
    },
    {
      to: "/hospital-portal/doctors",
      label: "Doctors & Specialists",
      icon: Users2
    },
    {
      to: "/hospital-portal/facilities",
      label: "Facilities & Units",
      icon: Building2
    },
    {
      to: "/hospital-portal/costs",
      label: "Costs & Insurance",
      icon: DollarSign
    },
    {
      to: "/hospital-portal/emergency-requests",
      label: "Emergency Requests",
      icon: Siren,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
    },
    {
      to: "/hospital-portal/profile",
      label: "Hospital Profile",
      icon: Hospital
    }
  ];

  const sidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "1.25rem 1rem",
        backgroundColor: "var(--brand-navy)",
        color: "#cbd5e1"
      }}
    >
      {/* Brand Header inside Sidebar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1.25rem",
          marginBottom: "1.25rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <Link
          to="/hospital-portal"
          onClick={onCloseMobile}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff"
            }}
          >
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff", lineHeight: 1.1 }}>
              CareLink
            </div>
            <div style={{ fontSize: "0.68rem", color: "#38bdf8", fontWeight: 700, letterSpacing: "0.04em" }}>
              HOSPITAL PORTAL
            </div>
          </div>
        </Link>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            style={{ color: "#94a3b8", padding: "0.25rem" }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Hospital Identity Mini Badge */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 0.85rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Active Operations Hub
        </div>
        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.92rem", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {hospital.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "4px" }}>
          <span className="status-dot available" />
          <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>
            Status: {hospital.status}
          </span>
        </div>
      </div>

      {/* Main Nav Items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "0.5rem", paddingLeft: "0.5rem" }}>
          Operations Menu
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  backgroundColor: isActive ? "var(--brand-blue)" : "transparent",
                  transition: "all var(--transition-fast)"
                })}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: "var(--emergency-red)",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      lineHeight: 1
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Switch to Patient Portal */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
        }}
      >
        <Link
          to="/"
          onClick={onCloseMobile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            color: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            fontWeight: 600
          }}
          title="Open Patient Portal in same session"
        >
          <ExternalLink size={15} />
          <span>View Patient Portal</span>
        </Link>

        <button
          onClick={resetToDemoDefaults}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.45rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.78rem",
            color: "#94a3b8",
            textAlign: "left"
          }}
          title="Reset hospital demo data to initial state"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Data</span>
        </button>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            color: "#f87171",
            textAlign: "left",
            fontWeight: 600
          }}
        >
          <LogOut size={16} />
          <span>Logout (Demo)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hospital-sidebar-desktop"
        style={{
          width: "260px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "none"
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="hospital-sidebar-mobile-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: "280px",
              height: "100%",
              maxWidth: "85vw",
              backgroundColor: "var(--brand-navy)",
              boxShadow: "var(--shadow-xl)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* CSS Helper for Sidebar Responsiveness */}
      <style>{`
        @media (min-width: 992px) {
          .hospital-sidebar-desktop {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
