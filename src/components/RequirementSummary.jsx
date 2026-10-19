import React from "react";
import { Link } from "react-router-dom";
import { Edit3, CheckCircle2, MapPin, Activity } from "lucide-react";

export default function RequirementSummary({ requirements }) {
  const { facilities = [], specialist, budget, insurance, emergencyType, age, gender, location, reportedComplaint } = requirements || {};

  const summaryItems = [
    ...facilities,
    specialist && specialist !== "No specific specialist" ? `Specialist: ${specialist}` : null,
    budget && budget !== "any" ? budget : null,
    insurance && insurance !== "No insurance" ? insurance : null
  ].filter(Boolean);

  return (
    <div style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid #bae6fd",
      borderRadius: "var(--radius-lg)",
      padding: "1.25rem 1.5rem",
      boxShadow: "var(--shadow-sm)",
      background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)",
      marginBottom: "2rem"
    }}>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "0.85rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--brand-blue-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brand-blue)"
          }}>
            <Activity size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-blue)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Active Patient Requirements
            </span>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              {emergencyType || "Emergency Care"} {age ? `• Patient: ${age}y${gender ? ` (${gender})` : ""}` : ""}
              {reportedComplaint && reportedComplaint !== emergencyType && (
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  • Problem: {reportedComplaint}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/emergency"
          className="btn btn-outline btn-sm"
          style={{ fontSize: "0.82rem", fontWeight: 600, gap: "0.35rem" }}
        >
          <Edit3 size={14} />
          <span>Modify Requirements</span>
        </Link>
      </div>

      {/* Pill summary list */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
        {location && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: "#e2e8f0",
            color: "#334155",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.25rem 0.65rem",
            borderRadius: "var(--radius-full)"
          }}>
            <MapPin size={12} color="var(--brand-teal)" />
            <span>Near {location}</span>
          </span>
        )}

        {summaryItems.length > 0 ? (
          summaryItems.map((item, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "var(--brand-blue-subtle)",
                color: "var(--brand-blue-hover)",
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.25rem 0.7rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid #bae6fd"
              }}
            >
              <CheckCircle2 size={13} color="var(--brand-blue)" />
              <span>{item}</span>
            </span>
          ))
        ) : (
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Showing all general emergency hospitals in Pune.
          </span>
        )}
      </div>
    </div>
  );
}
