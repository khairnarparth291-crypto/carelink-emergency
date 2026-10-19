import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Navigation,
  PhoneCall,
  ShieldAlert,
  Bed,
  Wind,
  HeartPulse,
  Activity,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RotateCcw
} from "lucide-react";
import { HOSPITALS } from "../data/hospitals";
import AvailabilityBadge from "../components/AvailabilityBadge";
import SpecialistCard from "../components/SpecialistCard";
import FacilityGrid from "../components/FacilityGrid";
import { useEmergency } from "../context/EmergencyContext";
import { mapBackendHospital, findDemoHospital } from "../utils/hospitalMapper";
import api from "../services/api";

const SLUG_TO_BACKEND_ID = {
  "care-hospital-pune": "670100000000000000000010",
  "apollo-care-pune": "670100000000000000000020",
  "ruby-metro-pune": "670100000000000000000030",
  "lilavati-care-mumbai": "670100000000000000000040",
  "kokilaben-metro-mumbai": "670100000000000000000050",
  "sahyadri-care-deccan": "670100000000000000000060",
  "bharati-medical-dhankawadi": "670100000000000000000070",
  "jupiter-baner-pune": "670100000000000000000080",
  "sancheti-ortho-shivaji": "670100000000000000000090",
  "kem-charity-rasta-peth": "670100000000000000000100",
  "manipal-kharadi-pune": "670100000000000000000110",
  "jehangir-station-pune": "670100000000000000000120"
};

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openCallModal, openDirectionsModal } = useEmergency();

  const [hospital, setHospital] = useState(() => {
    const demoFallback = findDemoHospital(id, HOSPITALS);
    return demoFallback ? { ...demoFallback, isLiveBackend: false } : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const loadHospitalDetails = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);

    const queryId = SLUG_TO_BACKEND_ID[id] || id;

    try {
      const res = await api.getHospital(queryId);
      if (res && res.success && res.data) {
        const mapped = mapBackendHospital(res.data, HOSPITALS);
        setHospital(mapped);
        setIsLiveBackend(true);
      } else {
        throw new Error(res?.message || "Hospital record not found on backend");
      }
    } catch (err) {
      console.warn("Could not fetch hospital from backend API:", err.message);
      const fallback = findDemoHospital(id, HOSPITALS);
      if (fallback) {
        setHospital({ ...fallback, isLiveBackend: false });
        setIsLiveBackend(false);
        setBackendError("Live hospital connection unavailable. Displaying demo reference data.");
      } else {
        setHospital(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHospitalDetails();
  }, [loadHospitalDetails]);

  if (isLoading && !hospital) {
    return (
      <div style={{ padding: "5rem 1rem", textAlign: "center" }}>
        <Loader2 size={40} color="var(--brand-blue)" className="spinner" style={{ animation: "spin 1s linear infinite", margin: "0 auto 1.25rem" }} />
        <h2 style={{ fontSize: "1.35rem", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
          Loading Hospital Profile...
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Querying real-time bed inventories, doctor roster, and facility readiness from hospital operations server.
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ padding: "5rem 1rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Hospital Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          The requested hospital ID does not exist in our network.
        </p>
        <Link to="/hospitals" className="btn btn-primary">
          Back to Hospital Search
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2.5rem 0 5rem", backgroundColor: "var(--bg-page)" }}>
      <div className="container">

        {/* Top Navigation & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <ArrowLeft size={16} />
            <span>Back to Results</span>
          </button>

          <button
            onClick={loadHospitalDetails}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            title="Refresh bed counts and doctor status"
          >
            <RotateCcw size={13} />
            <span>Refresh Live Data</span>
          </button>
        </div>

        {/* Offline Notice Banner if fallback */}
        {backendError && (
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.5rem",
            color: "#92400e",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}>
            <span>⚠️ <strong>Offline Notice:</strong> {backendError}</span>
            <button
              onClick={loadHospitalDetails}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderColor: "#d97706", color: "#92400e" }}
            >
              Retry Live Sync
            </button>
          </div>
        )}

        {/* Section 1: Hospital Header */}
        <div className="card" style={{
          padding: "2rem",
          marginBottom: "2rem",
          borderTop: hospital.emergencyStatus === "available"
            ? "5px solid var(--status-available)"
            : (hospital.emergencyStatus === "limited" ? "5px solid var(--status-limited)" : "5px solid var(--status-unavailable)")
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.5rem"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <AvailabilityBadge status={hospital.emergencyStatus} size="lg" />
                <span className="freshness-pill recent" style={{ fontSize: "0.82rem" }}>
                  <Clock size={13} />
                  <span>{hospital.lastVerified}</span>
                </span>

                {isLiveBackend ? (
                  <span style={{
                    fontSize: "0.75rem",
                    background: "#dcfce7",
                    color: "#15803d",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 700,
                    border: "1px solid #bbf7d0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                    <span>LIVE BACKEND DATA</span>
                  </span>
                ) : (
                  <span style={{
                    fontSize: "0.75rem",
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 700,
                    border: "1px solid #fde68a"
                  }}>
                    DEMO DATA (Offline Fallback)
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
                {hospital.name}
              </h1>

              <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
                <MapPin size={16} color="var(--brand-teal)" />
                <span>{hospital.address}, {hospital.city}</span>
              </p>

              {/* Transit Metrics */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", fontSize: "0.9rem" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "var(--brand-blue-subtle)",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  color: "var(--brand-blue)",
                  fontWeight: 600,
                  border: "1px solid #bae6fd"
                }}>
                  <Navigation size={14} />
                  <span>{hospital.distanceText} from current location</span>
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "#ecfdf5",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  color: "#065f46",
                  fontWeight: 600,
                  border: "1px solid #a7f3d0"
                }}>
                  <Clock size={14} />
                  <span>ETA ~{hospital.etaText} in traffic</span>
                </span>
              </div>
            </div>

            {/* Quick Header CTA Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
              <button
                onClick={() => openCallModal(hospital)}
                className="btn btn-emergency btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                id="header-call-hospital-btn"
              >
                <PhoneCall size={18} />
                <span>Call Hospital</span>
              </button>

              <button
                onClick={() => openDirectionsModal(hospital)}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                id="header-get-directions-btn"
              >
                <Navigation size={18} />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.85rem",
          marginBottom: "2rem"
        }}>
          <ShieldAlert size={22} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ color: "#92400e", fontSize: "0.95rem", display: "block", marginBottom: "0.2rem" }}>
              Important Hospital Admission Notice
            </strong>
            <p style={{ color: "#78350f", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Availability changes frequently. Please confirm bed/facility availability with the hospital before travelling.
            </p>
          </div>
        </div>

        {/* Section 2: Current Bed & Unit Availability */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.4rem", color: "var(--brand-navy)" }}>
              Current Bed & Facility Availability
            </h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Live hospital dashboard report
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem"
          }}>
            {/* General Beds */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>General Beds</span>
                <Bed size={18} color="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-navy)" }}>
                {hospital.generalBeds.available}
                <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "4px" }}>
                  / {hospital.generalBeds.total}
                </span>
              </div>
              <span className="freshness-pill recent" style={{ marginTop: "0.5rem" }}>
                <Clock size={11} />
                <span>{hospital.lastVerified}</span>
              </span>
            </div>

            {/* ICU Beds */}
            <div className="card" style={{
              padding: "1.25rem",
              backgroundColor: hospital.icuBeds.available > 0 ? "var(--status-available-bg)" : "var(--status-unavailable-bg)",
              border: `1.5px solid ${hospital.icuBeds.available > 0 ? "var(--status-available-border)" : "var(--status-unavailable-border)"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.85rem",
                  color: hospital.icuBeds.available > 0 ? "var(--status-available)" : "var(--status-unavailable)",
                  fontWeight: 700
                }}>
                  ICU Beds
                </span>
                <HeartPulse size={18} color={hospital.icuBeds.available > 0 ? "var(--status-available)" : "var(--status-unavailable)"} />
              </div>
              <div style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: hospital.icuBeds.available > 0 ? "var(--status-available)" : "var(--status-unavailable)"
              }}>
                {hospital.icuBeds.available} Available
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: hospital.icuBeds.available > 0 ? "#166534" : "#991b1b" }}>
                {hospital.lastVerified}
              </span>
            </div>

            {/* Ventilators */}
            <div className="card" style={{
              padding: "1.25rem",
              backgroundColor: hospital.ventilators.available > 0 ? "#f0fdf4" : "var(--status-unavailable-bg)",
              border: `1.5px solid ${hospital.ventilators.available > 0 ? "#bbf7d0" : "var(--status-unavailable-border)"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.85rem",
                  color: hospital.ventilators.available > 0 ? "#166534" : "var(--status-unavailable)",
                  fontWeight: 700
                }}>
                  Ventilators
                </span>
                <Wind size={18} color={hospital.ventilators.available > 0 ? "#166534" : "var(--status-unavailable)"} />
              </div>
              <div style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: hospital.ventilators.available > 0 ? "#166534" : "var(--status-unavailable)"
              }}>
                {hospital.ventilators.available} Units
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: hospital.ventilators.available > 0 ? "#166534" : "#991b1b" }}>
                {hospital.lastVerified}
              </span>
            </div>

            {/* Emergency Beds */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Casualty Bays</span>
                <Activity size={18} color="var(--brand-teal)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-navy)" }}>
                {hospital.emergencyBeds.available}
                <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "4px" }}>
                  / {hospital.emergencyBeds.total}
                </span>
              </div>
              <span className="freshness-pill recent" style={{ marginTop: "0.5rem" }}>
                <Clock size={11} />
                <span>{hospital.lastVerified}</span>
              </span>
            </div>

            {/* Operation Theatre */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Operation Theatres</span>
                <Activity size={18} color="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-navy)" }}>
                {hospital.operationTheatre.activeTheatres} Active
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--status-available)", fontWeight: 600 }}>
                Emergency surgical ready
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Specialists */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.4rem", color: "var(--brand-navy)" }}>
              Specialists & On-Call Doctors
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              Verified medical roster reported by hospital administration
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem"
          }}>
            {hospital.specialists.map((spec) => (
              <SpecialistCard key={spec.id} specialist={spec} />
            ))}
          </div>
        </div>

        {/* Section 4: Facilities Grid */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.4rem", color: "var(--brand-navy)" }}>
              Comprehensive Facilities & Diagnostic Units
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              Infrastructure status for trauma, surgical, and diagnostic workflows
            </p>
          </div>

          <FacilityGrid facilities={hospital.facilities} />
        </div>

        {/* Section 5: Cost Information & Section 6: Insurance */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem"
        }}>
          {/* Cost Estimates */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <CreditCard size={20} color="var(--brand-blue)" />
              <h2 style={{ fontSize: "1.25rem", color: "var(--brand-navy)" }}>
                Estimated Cost Information
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>General Bed (Estimated Daily)</span>
                <strong style={{ color: "var(--brand-navy)" }}>{hospital.estimatedCost.generalBed}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>ICU Bed (Estimated Daily)</span>
                <strong style={{ color: "var(--brand-navy)" }}>{hospital.estimatedCost.icu}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>OPD / Routine Consultation</span>
                <strong style={{ color: "var(--brand-navy)" }}>{hospital.estimatedCost.consultation}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Emergency Casualty Triage</span>
                <strong style={{ color: "var(--emergency-red)" }}>{hospital.estimatedCost.emergencyConsultation}</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: "var(--bg-subtle)",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8rem",
              color: "#475569",
              border: "1px dashed var(--border-medium)"
            }}>
              <strong>Notice:</strong> These are hospital-provided estimates. Actual treatment costs may vary based on diagnosis, procedures, and pharmaceutical requirements.
            </div>
          </div>

          {/* Insurance / Schemes */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <ShieldCheck size={20} color="var(--brand-teal)" />
              <h2 style={{ fontSize: "1.25rem", color: "var(--brand-navy)" }}>
                Supported Insurance & Schemes
              </h2>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              The following health insurance providers, TPAs, and government schemes are accepted:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
              {hospital.insurance.map((ins, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    background: "var(--brand-blue-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--brand-navy)",
                    border: "1px solid #bae6fd"
                  }}
                >
                  <CheckCircle2 size={16} color="var(--brand-blue)" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Always present the patient's Ayushman Bharat PM-JAY card or insurance policy document at the TPA desk during emergency registration.
            </div>
          </div>
        </div>

        {/* Section 7: Emergency Contact Action Bar */}
        <div className="card" style={{
          padding: "2rem",
          backgroundColor: "#132743",
          color: "#ffffff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem"
        }}>
          <div>
            <h3 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "0.35rem" }}>
              Need immediate admission at {hospital.name}?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Contact the Casualty Emergency Desk directly or dispatch an ambulance.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
            <button
              onClick={() => openCallModal(hospital)}
              className="btn btn-emergency btn-lg"
            >
              <PhoneCall size={18} />
              <span>Call Emergency Desk</span>
            </button>

            <button
              onClick={() => openDirectionsModal(hospital)}
              className="btn btn-primary btn-lg"
            >
              <Navigation size={18} />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
