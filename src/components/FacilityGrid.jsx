import React from "react";
import {
  HeartPulse,
  Wind,
  Siren,
  Activity,
  Droplet,
  Scan,
  Eye,
  Pill,
  Ambulance,
  Check,
  X,
  Sparkles
} from "lucide-react";

export default function FacilityGrid({ facilities = [] }) {
  // Facility icon mapping
  const getFacilityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("icu")) return <HeartPulse size={20} />;
    if (n.includes("ventilator")) return <Wind size={20} />;
    if (n.includes("emergency") || n.includes("trauma")) return <Siren size={20} />;
    if (n.includes("operation") || n.includes("theatre")) return <Activity size={20} />;
    if (n.includes("blood")) return <Droplet size={20} />;
    if (n.includes("ct scan")) return <Scan size={20} />;
    if (n.includes("mri")) return <Eye size={20} />;
    if (n.includes("pharmacy")) return <Pill size={20} />;
    if (n.includes("ambulance")) return <Ambulance size={20} />;
    return <Sparkles size={20} />;
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "1rem"
    }}>
      {facilities.map((fac) => {
        const isAvail = fac.available;
        return (
          <div
            key={fac.id || fac.name}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: `1.5px solid ${isAvail ? "#bae6fd" : "var(--border-light)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "1.1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              position: "relative",
              opacity: isAvail ? 1 : 0.75,
              boxShadow: isAvail ? "var(--shadow-sm)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: isAvail ? "var(--brand-blue-subtle)" : "var(--bg-subtle)",
                color: isAvail ? "var(--brand-blue)" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {getFacilityIcon(fac.name)}
              </div>

              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.2rem 0.55rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: isAvail ? "var(--status-available-bg)" : "var(--status-unavailable-bg)",
                color: isAvail ? "var(--status-available)" : "var(--status-unavailable)",
                border: `1px solid ${isAvail ? "var(--status-available-border)" : "var(--status-unavailable-border)"}`
              }}>
                {isAvail ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                <span>{isAvail ? "Active / Open" : "Unavailable"}</span>
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: "1rem", color: "var(--brand-navy)", marginBottom: "0.2rem" }}>
                {fac.name}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {fac.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
