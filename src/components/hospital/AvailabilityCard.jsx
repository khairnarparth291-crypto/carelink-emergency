import React from "react";
import { Link } from "react-router-dom";
import { Edit3, Clock } from "lucide-react";
import AvailabilityStatus from "./AvailabilityStatus";

export default function AvailabilityCard({
  title,
  subtitle,
  icon: Icon,
  total,
  occupied,
  available,
  lastUpdated = "Just now",
  editLink = "/hospital-portal/availability",
  iconBg = "#e0f2fe",
  iconColor = "#0284c7"
}) {
  const occupancyPercent = total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;
  const availablePercent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {Icon && (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: iconBg,
                  color: iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Icon size={22} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)", lineHeight: 1.2 }}>
                {title}
              </h3>
              {subtitle && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <AvailabilityStatus available={available} total={total} />
        </div>

        {/* Big Numbers */}
        <div style={{ margin: "1.25rem 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                color: available > 0 ? "var(--status-available)" : "var(--status-unavailable)",
                lineHeight: 1
              }}
            >
              {available}
            </span>
            <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>
              available
            </span>
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginTop: "0.35rem",
              fontWeight: 500
            }}
          >
            <strong>{occupied}</strong> / {total} occupied
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              height: "8px",
              width: "100%",
              backgroundColor: "#f1f5f9",
              borderRadius: "999px",
              overflow: "hidden",
              display: "flex"
            }}
          >
            <div
              style={{
                width: `${occupancyPercent}%`,
                backgroundColor: "#cbd5e1",
                transition: "width 0.3s ease"
              }}
              title={`Occupied: ${occupied} (${occupancyPercent}%)`}
            />
            <div
              style={{
                width: `${availablePercent}%`,
                backgroundColor: availablePercent > 30 ? "var(--brand-blue)" : availablePercent > 0 ? "#f59e0b" : "#ef4444",
                transition: "width 0.3s ease"
              }}
              title={`Available: ${available} (${availablePercent}%)`}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.35rem"
            }}
          >
            <span>Occupancy: {occupancyPercent}%</span>
            <span>Total Capacity: {total}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-light)",
          paddingTop: "0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8rem"
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)" }}>
          <Clock size={13} />
          <span>Last updated: {lastUpdated}</span>
        </span>

        <Link
          to={editLink}
          className="btn btn-outline btn-sm"
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.8rem",
            gap: "0.35rem"
          }}
        >
          <Edit3 size={13} />
          <span>Edit</span>
        </Link>
      </div>
    </div>
  );
}
