import React from "react";
import { Navigation, MapPin, Clock, ExternalLink, X, AlertTriangle } from "lucide-react";

export default function DirectionsModal({ hospital, onClose }) {
  if (!hospital) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hospital.name + ", " + hospital.address + ", " + hospital.city
  )}`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--brand-blue)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              <Navigation size={16} />
              <span>EMERGENCY TRANSIT NAVIGATION</span>
            </div>
            <h3 style={{ fontSize: "1.25rem" }}>{hospital.name}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
              <MapPin size={14} color="var(--brand-teal)" />
              {hospital.address}, {hospital.city}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "0.35rem", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Route Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ background: "var(--brand-blue-subtle)", border: "1px solid #bae6fd", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--brand-blue)", fontWeight: 600, display: "block" }}>ESTIMATED ETA</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--brand-navy)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={20} color="var(--brand-blue)" />
              {hospital.etaText}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Based on current Pune traffic</span>
          </div>

          <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-light)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>TOTAL DISTANCE</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--brand-navy)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={20} color="var(--brand-teal)" />
              {hospital.distanceText}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>From current location</span>
          </div>
        </div>

        {/* Simulated Route Card */}
        <div style={{ background: "#f8fafc", border: "1px dashed var(--border-medium)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
            Recommended Route (Live Simulation)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-blue)" }} />
              <span>Current Location: <strong>Pune Central</strong></span>
            </div>
            <div style={{ borderLeft: "2px solid #cbd5e1", marginLeft: "3px", paddingLeft: "15px", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Take closest arterial flyover toward {hospital.address.split(",")[0]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--emergency-red)" }} />
              <span>Destination: <strong>{hospital.name} Casualty Wing</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#854d0e", background: "#fef9c3", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.78rem", marginBottom: "1.25rem" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>If driving in an acute emergency, hazard lights should be engaged and local ambulance dispatch contacted.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 1.5 }}
          >
            <span>Open in Google Maps</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
