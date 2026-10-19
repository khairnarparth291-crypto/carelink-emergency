import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldAlert, PhoneCall } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "var(--brand-navy)",
      color: "#94a3b8",
      paddingTop: "3.5rem",
      paddingBottom: "2rem",
      marginTop: "auto",
      borderTop: "1px solid #1e293b"
    }}>
      <div className="container">
        {/* Top Emergency Bar */}
        <div style={{
          backgroundColor: "#132743",
          border: "1px solid #1e3a5f",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "3rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--emergency-red)"
            }}>
              <PhoneCall size={20} />
            </div>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "1rem" }}>
                National Emergency Helplines (India)
              </div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                Call directly for immediate government dispatch
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a
              href="tel:112"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span style={{ color: "#f87171" }}>112</span> All Emergencies
            </a>
            <a
              href="tel:108"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span style={{ color: "#38bdf8" }}>108</span> Ambulance
            </a>
            <a
              href="tel:102"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span style={{ color: "#4ade80" }}>102</span> Maternity
            </a>
          </div>
        </div>

        {/* Main Footer Links */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2.5rem",
          marginBottom: "2.5rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
              <Activity size={24} color="#38bdf8" />
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                CareLink Emergency
              </span>
            </div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "#94a3b8" }}>
              Streamlining urgent emergency healthcare coordination by connecting families with hospital-reported facilities, beds, specialists, and travel times.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <span style={{
                display: "inline-block",
                padding: "0.25rem 0.6rem",
                background: "rgba(234, 179, 8, 0.15)",
                color: "#fde047",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600
              }}>
                Prototype MVP — Part 1 (Patient Portal)
              </span>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
              <li>
                <Link to="/" style={{ color: "#cbd5e1" }}>Home</Link>
              </li>
              <li>
                <Link to="/emergency" style={{ color: "#cbd5e1" }}>Emergency Request Form</Link>
              </li>
              <li>
                <Link to="/find-hospital" style={{ color: "#cbd5e1" }}>Find Hospital (Non-Emergency)</Link>
              </li>
              <li>
                <Link to="/hospitals" style={{ color: "#cbd5e1" }}>Browse Hospitals in Pune</Link>
              </li>
              <li>
                <Link to="/hospital-portal" style={{ color: "#38bdf8", fontWeight: 600 }}>Hospital Operations Portal</Link>
              </li>
              <li>
                <Link to="/admin/login" style={{ color: "#f87171", fontWeight: 600 }}>Emergency Admin Portal</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Emergency Specialties
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
              <li style={{ color: "#cbd5e1" }}>Cardiology & STEMI Protocol</li>
              <li style={{ color: "#cbd5e1" }}>Trauma & Critical Poly-injury</li>
              <li style={{ color: "#cbd5e1" }}>Neurology & Acute Stroke</li>
              <li style={{ color: "#cbd5e1" }}>Pediatric & Neonatal ICU</li>
              <li style={{ color: "#cbd5e1" }}>Pulmonology & Respiratory Care</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Coverage Region
            </h4>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "0.75rem" }}>
              Initial MVP deployed for <strong>Pune Metropolitan Region, Maharashtra</strong>.
            </p>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Shivajinagar, Baner, Deccan, Kharadi, Sassoon Road, Rasta Peth, Dhankawadi.
            </p>
          </div>
        </div>

        {/* Safety Disclaimer as specified */}
        <div style={{
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          border: "1px solid #334155",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "2rem"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", color: "#f8fafc", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                Important Medical Safety Disclaimer:
              </strong>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "#94a3b8" }}>
                This platform is intended to help users find and compare hospital-reported information. It does not provide medical diagnosis or medical advice. Hospital availability can change rapidly. Always confirm availability and emergency acceptance directly with the hospital. In a life-threatening emergency, contact local emergency services.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and demo acknowledgement */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          fontSize: "0.8rem",
          color: "#64748b",
          borderTop: "1px solid #1e293b",
          paddingTop: "1.5rem"
        }}>
          <div>
            © {CURRENT_YEAR} CareLink Emergency. All rights reserved.
          </div>
          <div>
            Built with React & Vite • All hospital bed data displayed is DEMO DATA for prototype testing.
          </div>
        </div>
      </div>
    </footer>
  );
}
