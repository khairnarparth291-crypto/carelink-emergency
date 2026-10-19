import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  FileText,
  Shield,
  LogOut,
  X,
  ExternalLink
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    {
      to: "/admin",
      end: true,
      label: "Overview",
      icon: LayoutDashboard
    },
    {
      to: "/admin/hospitals",
      label: "Hospital Directory",
      icon: Building2
    },
    {
      to: "/admin/emergencies",
      label: "Emergency Monitor",
      icon: AlertTriangle
    },
    {
      to: "/admin/audit-logs",
      label: "Audit Logs",
      icon: FileText
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 40,
            display: "block"
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid #1e293b",
          position: mobileOpen ? "fixed" : "sticky",
          top: 0,
          bottom: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "transform 0.25s ease"
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            padding: "1.25rem 1.25rem",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 12px rgba(220, 38, 38, 0.4)"
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
                CareLink
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.06em"
                }}
              >
                Admin Console
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.25rem"
            }}
            className="admin-mobile-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Badge */}
        <div style={{ padding: "0.75rem 1.25rem 0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "0.75rem",
              color: "#34d399",
              fontWeight: 500
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 8px #10b981"
              }}
            />
            Live MongoDB Sync Active
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "0.75rem 0.75rem", overflowY: "auto" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#64748b",
              padding: "0.5rem 0.75rem",
              letterSpacing: "0.05em"
            }}
          >
            Administration
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
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
                    gap: "0.75rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: "none",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    backgroundColor: isActive ? "#dc2626" : "transparent",
                    transition: "all 0.15s ease"
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#64748b",
              padding: "1.25rem 0.75rem 0.5rem",
              letterSpacing: "0.05em"
            }}
          >
            Quick Links
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                color: "#94a3b8",
                textDecoration: "none"
              }}
            >
              <span>Patient Portal</span>
              <ExternalLink size={14} />
            </a>
            <a
              href="/hospital-portal/login"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                color: "#94a3b8",
                textDecoration: "none"
              }}
            >
              <span>Hospital Desk Login</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </nav>

        {/* Footer User Info & Logout */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #1e293b",
            backgroundColor: "#090d16"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#f8fafc"
                }}
              >
                {admin?.name || "Administrator"}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {admin?.email || "admin@carelink.org"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                borderRadius: "6px",
                padding: "0.45rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
