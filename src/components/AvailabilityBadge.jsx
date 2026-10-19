import React from "react";

export default function AvailabilityBadge({ status, showLabel = true, size = "md" }) {
  const normalized = (status || "available").toLowerCase();

  let label = "Available";
  let variantClass = "badge-available";
  let dotClass = "available";

  if (normalized === "limited") {
    label = "Limited availability";
    variantClass = "badge-limited";
    dotClass = "limited";
  } else if (normalized === "unavailable" || normalized === "not currently available") {
    label = "Not currently available";
    variantClass = "badge-unavailable";
    dotClass = "unavailable";
  }

  return (
    <span className={`badge-status ${variantClass} badge-${size}`}>
      <span className={`status-dot ${dotClass}`} aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
