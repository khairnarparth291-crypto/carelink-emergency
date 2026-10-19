import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import NotificationDropdown from "./NotificationDropdown";

export default function HospitalHeader({ onToggleMobileMenu }) {
  const { hospital, logout, activeHospitalId, switchHospital } = useHospitalPortal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/hospital-portal/login");
  };

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 90
      }}
    >
      {/* Left side: Hamburger button (on mobile) & Hospital Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="hospital-mobile-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            color: "var(--brand-navy)"
          }}
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--brand-navy)",
                lineHeight: 1.2
              }}
            >
              {hospital.name}
            </span>

            {/* Hospital status indicator */}
            <span
              className="badge-status badge-available"
              style={{ padding: "0.15rem 0.5rem", fontSize: "0.72rem", gap: "0.3rem" }}
            >
              <span className="status-dot available" />
              <span>{hospital.status}</span>
            </span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Emergency Operations Hub • {hospital.city}, {hospital.state || "Maharashtra"}
          </div>
        </div>
      </div>

      {/* Right side: Desk Switcher, Notifications, Profile, Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Hospital Desk Switcher */}
        <div className="desktop-only-text" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <label htmlFor="hospital-desk-select" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Desk:
          </label>
          <select
            id="hospital-desk-select"
            value={activeHospitalId}
            onChange={(e) => switchHospital && switchHospital(e.target.value)}
            style={{
              padding: "0.35rem 0.65rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-medium)",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--brand-navy)",
              cursor: "pointer"
            }}
            title="Switch Hospital Operations Desk"
          >
            <optgroup label="Pune Network Desks">
              <option value="670100000000000000000010">Care Hospital Pune</option>
              <option value="670100000000000000000020">Apollo Care Hospital — Pune</option>
              <option value="670100000000000000000030">Ruby Metro Multispeciality Hospital</option>
              <option value="670100000000000000000060">Sahyadri Care Hospital — Deccan</option>
              <option value="670100000000000000000070">Bharati Trust Hospital & Research Centre</option>
              <option value="670100000000000000000080">Jupiter Premier Hospital — Baner</option>
              <option value="670100000000000000000090">Sancheti Emergency & Trauma Hospital</option>
              <option value="670100000000000000000100">KEM Memorial Hospital — Rasta Peth</option>
              <option value="670100000000000000000110">Manipal Super Specialty Hospital — Kharadi</option>
              <option value="670100000000000000000120">Jehangir Hospital — Central Pune</option>
            </optgroup>
            <optgroup label="Mumbai Network Desks">
              <option value="670100000000000000000040">Lilavati Hospital — Bandra</option>
              <option value="670100000000000000000050">Kokilaben Dhirubhai Ambani Hospital</option>
            </optgroup>
          </select>
        </div>
        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile Link */}
        <Link
          to="/hospital-portal/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--brand-navy)",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "all var(--transition-fast)"
          }}
          title="Hospital Profile & Settings"
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#e0f2fe",
              color: "var(--brand-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <User size={14} />
          </div>
          <span className="desktop-only-text">Profile</span>
        </Link>

        {/* Logout (Demo) */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="btn btn-outline btn-sm"
          style={{
            padding: "0.45rem 0.75rem",
            color: "var(--text-muted)",
            borderColor: "var(--border-light)"
          }}
          title="Sign out of hospital account"
        >
          <LogOut size={16} />
          <span className="desktop-only-text">Logout</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hospital-mobile-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .desktop-only-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
