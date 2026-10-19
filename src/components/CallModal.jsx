import React from "react";
import { Phone, PhoneCall, ShieldAlert, X, Ambulance } from "lucide-react";

export default function CallModal({ hospital, onClose }) {
  if (!hospital) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--emergency-red)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              <PhoneCall size={16} />
              <span>EMERGENCY DESK CONTACT</span>
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>{hospital.name}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{hospital.address}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "0.35rem", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ background: "var(--emergency-light)", border: "1px solid var(--emergency-border)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <ShieldAlert size={20} color="var(--emergency-red)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", color: "var(--emergency-red)", fontSize: "0.9rem" }}>
                Confirm Critical Admission
              </strong>
              <p style={{ fontSize: "0.82rem", color: "#7f1d1d", marginTop: "2px" }}>
                Before transporting a critical patient, ask the triage desk: <em>"Do you currently have an open ICU bed and ventilator for emergency admission?"</em>
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
          <a
            href={`tel:${hospital.emergencyHelpline}`}
            className="btn btn-emergency"
            style={{ justifyContent: "space-between", padding: "0.85rem 1.25rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <PhoneCall size={18} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>24x7 Emergency Casualty Desk</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{hospital.emergencyHelpline}</div>
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)" }}>
              Call Now
            </span>
          </a>

          {hospital.ambulanceContact && (
            <a
              href={`tel:${hospital.ambulanceContact}`}
              className="btn btn-outline"
              style={{ justifyContent: "space-between", padding: "0.75rem 1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Ambulance size={18} color="var(--brand-blue)" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ambulance Dispatch</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{hospital.ambulanceContact}</div>
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--brand-blue)", fontWeight: 600 }}>
                Request Ambulance
              </span>
            </a>
          )}

          <a
            href={`tel:${hospital.phone}`}
            className="btn btn-secondary"
            style={{ justifyContent: "space-between", padding: "0.65rem 1.25rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Phone size={16} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hospital General Line</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{hospital.phone}</div>
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Call General</span>
          </a>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
