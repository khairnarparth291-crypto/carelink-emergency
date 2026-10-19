import React, { useState } from "react";
import {
  ShieldAlert,
  Activity,
  Wind,
  Crosshair,
  Droplet,
  Radio,
  Scan,
  Pill,
  Truck,
  RefreshCw,
  Baby,
  HeartHandshake,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit2,
  Check
} from "lucide-react";

// Icon mapping dictionary
const ICON_MAP = {
  ShieldAlert,
  Activity,
  Wind,
  Crosshair,
  Droplet,
  Radio,
  Scan,
  Pill,
  Truck,
  RefreshCw,
  Baby,
  HeartHandshake
};

export default function FacilityCard({ facility, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(facility.status);
  const [details, setDetails] = useState(facility.details || "");
  const [capacity, setCapacity] = useState(facility.capacity || "");

  const IconComponent = ICON_MAP[facility.iconName] || Activity;

  const handleSave = () => {
    onUpdate(facility.id, { status, details, capacity });
    setIsEditing(false);
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case "Available":
        return {
          icon: <CheckCircle size={13} />,
          badgeClass: "badge-available",
          border: "var(--status-available)"
        };
      case "Limited":
        return {
          icon: <AlertCircle size={13} />,
          badgeClass: "badge-limited",
          border: "var(--status-limited)"
        };
      default:
        return {
          icon: <XCircle size={13} />,
          badgeClass: "badge-unavailable",
          border: "var(--status-unavailable)"
        };
    }
  };

  const badge = getStatusBadge(facility.status);

  return (
    <div
      className="card card-hover"
      style={{
        padding: "1.35rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderTop: `4px solid ${badge.border}`
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#f0f9ff",
                color: "var(--brand-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <IconComponent size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--brand-navy)", lineHeight: 1.25 }}>
                {facility.name}
              </h3>
              {facility.capacity && (
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {facility.capacity}
                </div>
              )}
            </div>
          </div>

          <span
            className={`badge-status ${badge.badgeClass}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.75rem",
              padding: "0.2rem 0.55rem"
            }}
          >
            {badge.icon}
            <span>{facility.status}</span>
          </span>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.45, marginBottom: "1rem" }}>
          {facility.details}
        </p>

        {isEditing && (
          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem"
            }}
          >
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Update Operational Status:
              </label>
              <select
                className="form-select"
                style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Available">🟢 Available</option>
                <option value="Limited">🟡 Limited</option>
                <option value="Unavailable">🔴 Unavailable</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Capacity Note / Readiness:
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                placeholder="e.g. 24/7 operating, 3 active bays"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Description / Equipment Details:
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border-light)",
          paddingTop: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem"
        }}
      >
        {isEditing ? (
          <div style={{ display: "flex", width: "100%", gap: "0.5rem" }}>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }}
            >
              <Check size={14} />
              <span>Save</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Reported to Network
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem", gap: "0.35rem" }}
            >
              <Edit2 size={13} />
              <span>Modify Status</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
