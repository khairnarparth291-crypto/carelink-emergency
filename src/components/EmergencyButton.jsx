import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Siren } from "lucide-react";

export default function EmergencyButton() {
  const location = useLocation();

  // Hide on the emergency form itself
  if (location.pathname === "/emergency") {
    return null;
  }

  return (
    <Link
      to="/emergency"
      className="floating-emergency-btn"
      aria-label="Find Emergency Hospital Care"
      id="floating-emergency-cta"
    >
      <Siren size={20} />
      <span>Emergency Care</span>
    </Link>
  );
}
