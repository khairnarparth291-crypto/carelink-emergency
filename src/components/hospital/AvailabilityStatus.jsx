import React from "react";
import { calculateAvailabilityStatus } from "../../context/HospitalPortalContext";

export default function AvailabilityStatus({ available, total, customStatus = null, showLabel = true, size = "md" }) {
  const statusInfo = customStatus
    ? {
        status: customStatus.toLowerCase(),
        label: customStatus,
        badgeClass:
          customStatus.toLowerCase() === "available"
            ? "badge-available"
            : customStatus.toLowerCase() === "limited"
            ? "badge-limited"
            : "badge-unavailable",
        dotClass:
          customStatus.toLowerCase() === "available"
            ? "available"
            : customStatus.toLowerCase() === "limited"
            ? "limited"
            : "unavailable",
        icon:
          customStatus.toLowerCase() === "available"
            ? "🟢"
            : customStatus.toLowerCase() === "limited"
            ? "🟡"
            : "🔴"
      }
    : calculateAvailabilityStatus(available, total);

  return (
    <span
      className={`badge-status ${statusInfo.badgeClass}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.9rem" : "0.82rem",
        padding: size === "sm" ? "0.15rem 0.5rem" : "0.25rem 0.65rem"
      }}
      title={`Calculated status: ${statusInfo.label}`}
    >
      <span className={`status-dot ${statusInfo.dotClass}`} />
      {showLabel && <span>{statusInfo.label}</span>}
    </span>
  );
}
