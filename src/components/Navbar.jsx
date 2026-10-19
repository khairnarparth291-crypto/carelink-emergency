import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Activity, Siren, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--border-light)"
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px"
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }} onClick={handleNavClick}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)"
          }}>
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--brand-navy)",
                letterSpacing: "-0.02em"
              }}>
                CareLink
              </span>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--emergency-red)",
                backgroundColor: "var(--emergency-light)",
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--emergency-border)"
              }}>
                EMERGENCY
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Hospital Coordination Portal
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: "none" }} className="desktop-nav">
          <ul style={{
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
            listStyle: "none"
          }}>
            <li>
              <NavLink
                to="/"
                end
                style={({ isActive }) => ({
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: isActive ? "var(--brand-blue)" : "var(--text-main)",
                  transition: "color var(--transition-fast)"
                })}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/find-hospital"
                style={({ isActive }) => ({
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: isActive ? "var(--brand-blue)" : "var(--text-main)",
                  transition: "color var(--transition-fast)"
                })}
              >
                Find Hospital
              </NavLink>
            </li>
            <li>
              <a
                href="/#how-it-works"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "var(--text-main)",
                  transition: "color var(--transition-fast)"
                }}
              >
                How It Works
              </a>
            </li>
            <li>
              <NavLink
                to="/hospitals"
                style={({ isActive }) => ({
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: isActive ? "var(--brand-blue)" : "var(--text-main)",
                  transition: "color var(--transition-fast)"
                })}
              >
                Hospitals
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hospital-portal"
                style={({ isActive }) => ({
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: isActive ? "var(--brand-blue)" : "var(--brand-navy)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(2, 132, 199, 0.08)",
                  border: "1px solid rgba(2, 132, 199, 0.2)",
                  transition: "all var(--transition-fast)"
                })}
              >
                <span>Hospital Portal</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <Link
            to="/emergency"
            className="btn btn-emergency btn-sm"
            style={{ fontWeight: 700 }}
            id="nav-emergency-btn"
          >
            <Siren size={16} />
            <span>Emergency Request</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              color: "var(--brand-navy)"
            }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-light)",
            padding: "1rem 1.25rem 1.5rem",
            boxShadow: "var(--shadow-md)"
          }}
          className="mobile-nav-drawer"
        >
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <li>
              <Link
                to="/"
                onClick={handleNavClick}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--brand-navy)"
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/find-hospital"
                onClick={handleNavClick}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--brand-navy)"
                }}
              >
                Find Hospital
              </Link>
            </li>
            <li>
              <a
                href="/#how-it-works"
                onClick={handleNavClick}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--brand-navy)"
                }}
              >
                How It Works
              </a>
            </li>
            <li>
              <Link
                to="/hospitals"
                onClick={handleNavClick}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "var(--brand-navy)"
                }}
              >
                Browse Hospitals
              </Link>
            </li>
            <li>
              <Link
                to="/hospital-portal"
                onClick={handleNavClick}
                style={{
                  display: "block",
                  padding: "0.5rem 0",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--brand-blue)"
                }}
              >
                Hospital Operations Portal (Part 2)
              </Link>
            </li>
            <li style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-light)" }}>
              <Link
                to="/emergency"
                onClick={handleNavClick}
                className="btn btn-emergency"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Siren size={18} />
                <span>Go to Emergency Request Form</span>
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Media query helper styles embedded for desktop vs mobile nav */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
