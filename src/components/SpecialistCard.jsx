import React from "react";
import { User, CheckCircle2 } from "lucide-react";

export default function SpecialistCard({ specialist }) {
  const isAvailable = specialist.status === "Available";

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-light)",
      borderRadius: "var(--radius-lg)",
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.85rem",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: isAvailable ? "var(--brand-blue-subtle)" : "var(--bg-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isAvailable ? "var(--brand-blue)" : "var(--text-muted)",
            border: `1.5px solid ${isAvailable ? "#bae6fd" : "var(--border-light)"}`
          }}>
            <User size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", color: "var(--brand-navy)", marginBottom: "2px" }}>
              {specialist.name}
            </h4>
            <div style={{ fontSize: "0.85rem", color: "var(--brand-blue)", fontWeight: 600 }}>
              {specialist.specialty}
            </div>
          </div>
        </div>

        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          padding: "0.2rem 0.6rem",
          borderRadius: "var(--radius-full)",
          backgroundColor: isAvailable ? "var(--status-available-bg)" : "var(--status-unavailable-bg)",
          color: isAvailable ? "var(--status-available)" : "var(--status-unavailable)",
          border: `1px solid ${isAvailable ? "var(--status-available-border)" : "var(--status-unavailable-border)"}`
        }}>
          {isAvailable && <CheckCircle2 size={12} />}
          <span>{specialist.status}</span>
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem",
        fontSize: "0.8rem",
        background: "var(--bg-subtle)",
        padding: "0.6rem 0.85rem",
        borderRadius: "var(--radius-md)"
      }}>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Duty Status</span>
          <strong style={{ color: "var(--brand-navy)" }}>{specialist.onCall}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Experience</span>
          <strong style={{ color: "var(--brand-navy)" }}>{specialist.experience}</strong>
        </div>
      </div>

      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <span>Qualifications: </span>
        <strong style={{ color: "#334155" }}>{specialist.qualifications}</strong>
      </div>
    </div>
  );
}
