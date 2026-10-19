import React from "react";
import { UserCheck, Clock, Award, Phone, CheckCircle2, XCircle, RefreshCw, Edit2, Trash2 } from "lucide-react";

export default function DoctorCard({ doctor, onEdit, onToggleAvailability, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "On Duty":
        return {
          icon: <CheckCircle2 size={13} />,
          label: "On Duty",
          className: "badge-available",
          dotColor: "var(--status-available)"
        };
      case "On Call":
        return {
          icon: <Clock size={13} />,
          label: "On Call",
          className: "badge-limited",
          dotColor: "var(--status-limited)"
        };
      default:
        return {
          icon: <XCircle size={13} />,
          label: "Unavailable",
          className: "badge-unavailable",
          dotColor: "var(--status-unavailable)"
        };
    }
  };

  const badge = getStatusBadge(doctor.status);

  return (
    <div
      className="card card-hover"
      style={{
        padding: "1.35rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderLeft: `4px solid ${
          doctor.status === "On Duty"
            ? "var(--status-available)"
            : doctor.status === "On Call"
            ? "var(--status-limited)"
            : "var(--status-unavailable)"
        }`
      }}
    >
      <div>
        {/* Header with Name & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)", lineHeight: 1.25 }}>
              {doctor.name}
            </h3>
            <div style={{ display: "inline-block", color: "var(--brand-blue)", fontWeight: 600, fontSize: "0.85rem", marginTop: "2px" }}>
              {doctor.specialty}
            </div>
          </div>

          <span
            className={`badge-status ${badge.className}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.75rem",
              padding: "0.2rem 0.55rem",
              flexShrink: 0
            }}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Doctor Details List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.82rem", color: "var(--text-main)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <Award size={14} style={{ color: "var(--brand-blue)", flexShrink: 0 }} />
            <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{doctor.qualification}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <UserCheck size={14} style={{ color: "var(--brand-teal)", flexShrink: 0 }} />
            <span>{doctor.experience}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <Clock size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <span>Timing: <strong>{doctor.workingHours}</strong></span>
          </div>

          {doctor.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
              <Phone size={14} style={{ color: "#64748b", flexShrink: 0 }} />
              <span>{doctor.phone}</span>
            </div>
          )}
        </div>

        {/* On Call Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Emergency On-Call:
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: doctor.onCall ? "#ecfdf5" : "#f1f5f9",
              color: doctor.onCall ? "#065f46" : "#64748b",
              border: `1px solid ${doctor.onCall ? "#a7f3d0" : "#cbd5e1"}`
            }}
          >
            {doctor.onCall ? "YES — Active on emergency list" : "NO — Off-call"}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div
        style={{
          borderTop: "1px solid var(--border-light)",
          paddingTop: "0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem"
        }}
      >
        <button
          onClick={() => onToggleAvailability(doctor.id)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem", flex: 1, justifyContent: "center" }}
          title="Cycle through On Duty / On Call / Unavailable"
        >
          <RefreshCw size={13} />
          <span>Toggle Status</span>
        </button>

        <button
          onClick={() => onEdit(doctor)}
          className="btn btn-outline btn-sm"
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem" }}
          title="Edit Doctor Details"
        >
          <Edit2 size={13} />
          <span>Edit</span>
        </button>

        {onDelete && (
          <button
            onClick={() => onDelete(doctor.id)}
            aria-label="Remove doctor"
            style={{
              padding: "0.35rem 0.5rem",
              color: "var(--text-muted)",
              borderRadius: "var(--radius-sm)",
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--emergency-red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Remove from roster"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
