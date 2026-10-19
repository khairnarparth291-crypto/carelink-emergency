import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Bed,
  Wind,
  UserCheck,
  XCircle,
  CreditCard,
  ShieldCheck,
  PhoneCall,
  Navigation,
  Check,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";
import AvailabilityBadge from "./AvailabilityBadge";
import { useEmergency } from "../context/EmergencyContext";
import { findSpecialistMatch } from "../utils/matching";

export default function HospitalCard({ matchResult }) {
  const {
    hospital,
    checks = [],
    matchCount = 0,
    totalRequirements = 0,
    requestedSpecialist: resultReqSpec,
    matchedSpecialist: resultMatchedSpec,
    isSpecialistMatched: resultIsMatched
  } = matchResult;
  const { requirements, openCallModal, openDirectionsModal } = useEmergency();

  // Resolve requested specialist: prefer matchResult or active patient requirements
  const activeReqSpec = resultReqSpec !== undefined
    ? resultReqSpec
    : (
        requirements?.specialist &&
        requirements.specialist.trim().toLowerCase() !== "no specific specialist" &&
        requirements.specialist.trim().toLowerCase() !== "other"
          ? requirements.specialist.trim()
          : null
      );

  const isRequestedSpecialist = Boolean(activeReqSpec);

  // Determine specialist to display
  let displayedSpecialist = null;
  let isSpecialistAvailable = false;

  if (isRequestedSpecialist) {
    if (resultMatchedSpec !== undefined && resultIsMatched !== undefined) {
      displayedSpecialist = resultMatchedSpec;
      isSpecialistAvailable = Boolean(resultIsMatched);
    } else {
      const match = findSpecialistMatch(hospital.specialists || [], activeReqSpec);
      displayedSpecialist = match.matchedSpecialist;
      isSpecialistAvailable = match.isAvailable;
    }
  } else {
    // When no specific specialist was requested, show the primary specialist on duty
    displayedSpecialist = hospital.specialists?.find(s => {
      const st = (s.status || "").toLowerCase();
      return st === "available" || st === "on_duty" || st === "on duty" || st === "on_call" || st === "on call";
    }) || hospital.specialists?.[0] || null;
    isSpecialistAvailable = Boolean(
      displayedSpecialist &&
      (() => {
        const st = (displayedSpecialist.status || "").toLowerCase();
        return st === "available" || st === "on_duty" || st === "on duty" || st === "on_call" || st === "on call";
      })()
    );
  }

  return (
    <article className="card card-hover" style={{
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      position: "relative",
      overflow: "hidden",
      borderLeft: hospital.emergencyStatus === "available"
        ? "4px solid var(--status-available)"
        : (hospital.emergencyStatus === "limited" ? "4px solid var(--status-limited)" : "4px solid var(--status-unavailable)")
    }}>
      {/* Top Header: Hospital Name, Status, and Data Freshness */}
      <div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <AvailabilityBadge status={hospital.emergencyStatus} />

            {/* Highly Prominent Data Freshness */}
            <span className="freshness-pill recent" title="Time since hospital staff verified bed numbers">
              <Clock size={12} />
              <span>{hospital.lastVerified}</span>
            </span>
          </div>

          {/* Quick Distance & ETA */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.85rem",
            color: "var(--brand-navy)",
            background: "var(--brand-blue-subtle)",
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            border: "1px solid #bae6fd"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Navigation size={13} color="var(--brand-blue)" />
              {hospital.distanceText}
            </span>
            <span style={{ color: "#94a3b8" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--brand-blue)" }}>
              <Clock size={13} />
              ETA {hospital.etaText}
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.25rem" }}>
          <Link to={`/hospital/${hospital.id}`} style={{ color: "var(--brand-navy)", transition: "color var(--transition-fast)" }}>
            {hospital.name}
          </Link>
        </h3>

        <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <MapPin size={14} color="var(--brand-teal)" />
          {hospital.address}, {hospital.city}
        </p>
      </div>

      {/* Match Breakdown Section */}
      {totalRequirements > 0 && (
        <div style={{
          backgroundColor: "#f8fafc",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1rem"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.5rem"
          }}>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: matchCount === totalRequirements ? "var(--status-available)" : "var(--brand-navy)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}>
              <Sparkles size={14} />
              {matchCount}/{totalRequirements} requirements matched
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Hospital capability breakdown
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {checks.map((c, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: c.matched ? "var(--status-available-bg)" : "var(--status-unavailable-bg)",
                  color: c.matched ? "var(--status-available)" : "var(--status-unavailable)",
                  border: `1px solid ${c.matched ? "var(--status-available-border)" : "var(--status-unavailable-border)"}`
                }}
              >
                {c.matched ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bed Availability Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "0.6rem"
      }}>
        {/* General Beds */}
        <div style={{
          background: "var(--bg-subtle)",
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-light)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Bed size={13} />
            <span>General Beds</span>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)", marginTop: "2px" }}>
            {hospital.generalBeds?.available > 0 ? (
              <span>{hospital.generalBeds.available} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>/ {hospital.generalBeds.total}</span></span>
            ) : (
              <span style={{ color: "var(--emergency-red)", fontSize: "0.95rem" }}>Ward Full</span>
            )}
          </div>
        </div>

        {/* ICU Beds */}
        <div style={{
          background: hospital.icuBeds?.available > 0 ? "var(--status-available-bg)" : "var(--status-unavailable-bg)",
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${hospital.icuBeds?.available > 0 ? "var(--status-available-border)" : "var(--status-unavailable-border)"}`
        }}>
          <div style={{
            fontSize: "0.75rem",
            color: hospital.icuBeds?.available > 0 ? "var(--status-available)" : "var(--status-unavailable)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontWeight: 600
          }}>
            <Bed size={13} />
            <span>ICU Beds</span>
          </div>
          <div style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: hospital.icuBeds?.available > 0 ? "var(--status-available)" : "var(--status-unavailable)",
            marginTop: "2px"
          }}>
            {hospital.icuBeds?.available > 0 ? `${hospital.icuBeds.available} Available` : "0 Available"}
          </div>
        </div>

        {/* Ventilators */}
        <div style={{
          background: hospital.ventilators?.available > 0 ? "#f0fdf4" : "var(--status-unavailable-bg)",
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${hospital.ventilators?.available > 0 ? "#bbf7d0" : "var(--status-unavailable-border)"}`
        }}>
          <div style={{
            fontSize: "0.75rem",
            color: hospital.ventilators?.available > 0 ? "#166534" : "var(--status-unavailable)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontWeight: 600
          }}>
            <Wind size={13} />
            <span>Ventilators</span>
          </div>
          <div style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: hospital.ventilators?.available > 0 ? "#166534" : "var(--status-unavailable)",
            marginTop: "2px"
          }}>
            {hospital.ventilators?.available > 0 ? `${hospital.ventilators.available} Available` : "0 Units"}
          </div>
        </div>
      </div>

      {/* Specialist & Cost Details */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.85rem",
        fontSize: "0.85rem",
        borderTop: "1px dashed var(--border-light)",
        paddingTop: "0.85rem"
      }}>
        {/* Specialist */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          {isRequestedSpecialist && !isSpecialistAvailable ? (
            <XCircle size={16} color="var(--status-unavailable)" style={{ marginTop: "2px", flexShrink: 0 }} />
          ) : (
            <UserCheck size={16} color="var(--brand-blue)" style={{ marginTop: "2px", flexShrink: 0 }} />
          )}
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              {isRequestedSpecialist && !isSpecialistAvailable ? "Requested Specialist" : "Specialist On Duty"}
            </span>
            {isRequestedSpecialist ? (
              isSpecialistAvailable && displayedSpecialist ? (
                <span style={{ fontWeight: 600, color: "var(--brand-navy)" }}>
                  {displayedSpecialist.specialty || displayedSpecialist.specialization || activeReqSpec} — <span style={{ color: "var(--status-available)" }}>Available ({displayedSpecialist.onCall || "In House"})</span>
                </span>
              ) : (
                <span style={{ fontWeight: 600, color: "var(--brand-navy)" }}>
                  {activeReqSpec} — <span style={{ color: "var(--status-unavailable)", fontWeight: 700 }}>Not Available</span>
                </span>
              )
            ) : displayedSpecialist ? (
              <span style={{ fontWeight: 600, color: "var(--brand-navy)" }}>
                {displayedSpecialist.specialty || displayedSpecialist.specialization} — <span style={{ color: "var(--status-available)" }}>{displayedSpecialist.status || "Available"} ({displayedSpecialist.onCall || "In House"})</span>
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>General Physician on duty</span>
            )}
          </div>
        </div>

        {/* Cost */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <CreditCard size={16} color="var(--brand-teal)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Estimated Cost</span>
            <span style={{ fontWeight: 700, color: "var(--brand-navy)" }}>
              {hospital.estimatedCost?.dailyRange || hospital.estimatedCost?.budgetTier}
            </span>
          </div>
        </div>

        {/* Insurance */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <ShieldCheck size={16} color="var(--brand-blue)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Insurance Coverage</span>
            <span style={{ fontWeight: 600, color: "var(--brand-navy)" }}>
              {hospital.insurance?.slice(0, 2).join(" • ")} {hospital.insurance?.length > 2 && `+${hospital.insurance.length - 2} more`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: View Hospital (Primary), Get Directions (Secondary), Call Hospital (Third) */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.6rem",
        marginTop: "auto",
        borderTop: "1px solid var(--border-light)",
        paddingTop: "1rem"
      }}>
        <Link
          to={`/hospital/${hospital.id}`}
          className="btn btn-primary"
          style={{ flex: "1 1 140px" }}
          id={`view-hospital-${hospital.id}`}
        >
          <span>View Hospital</span>
          <ChevronRight size={16} />
        </Link>

        <button
          onClick={() => openDirectionsModal(hospital)}
          className="btn btn-outline"
          style={{ flex: "1 1 130px" }}
          id={`directions-${hospital.id}`}
        >
          <Navigation size={15} color="var(--brand-blue)" />
          <span>Get Directions</span>
        </button>

        <button
          onClick={() => openCallModal(hospital)}
          className="btn btn-emergency"
          style={{ flex: "1 1 120px" }}
          id={`call-${hospital.id}`}
        >
          <PhoneCall size={15} />
          <span>Call Hospital</span>
        </button>
      </div>
    </article>
  );
}
