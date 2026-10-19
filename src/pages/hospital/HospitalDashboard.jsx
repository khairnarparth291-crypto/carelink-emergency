import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Activity,
  Wind,
  ShieldAlert,
  Clock,
  ArrowRight,
  Siren,
  Users2,
  Building2,
  DollarSign,
  HeartPulse,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Check,
  X
} from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import AvailabilityCard from "../../components/hospital/AvailabilityCard";
import AvailabilityStatus from "../../components/hospital/AvailabilityStatus";
import ConfirmModal from "../../components/hospital/ConfirmModal";
import { getDirectionsUrl } from "../../utils/locationHelper";

export default function HospitalDashboard() {
  const {
    hospital,
    beds,
    doctors,
    operationTheatre,
    bloodBank,
    emergencyRequests,
    pendingRequestsCount,
    isBackendConnected,
    reviewEmergencyRequest,
    acceptEmergencyRequest,
    rejectEmergencyRequest,
    completeEmergencyRequest
  } = useHospitalPortal();

  // Action modal state for quick response directly from the dashboard
  const [activeModal, setActiveModal] = useState(null); // { type: 'review'|'accept'|'reject'|'complete', request: obj }
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const handleOpenReviewModal = (req) => setActiveModal({ type: "review", request: req });
  const handleOpenAcceptModal = (req) => setActiveModal({ type: "accept", request: req });
  const handleOpenRejectModal = (req) => setActiveModal({ type: "reject", request: req });
  const handleOpenCompleteModal = (req) => setActiveModal({ type: "complete", request: req });

  const handleModalConfirm = async (reasonOrNote, optionalNote) => {
    if (!activeModal || isActionSubmitting) return;
    const reqId = activeModal.request.id || activeModal.request._id;
    setIsActionSubmitting(true);
    try {
      if (activeModal.type === "review") {
        await reviewEmergencyRequest(reqId, reasonOrNote);
      } else if (activeModal.type === "accept") {
        await acceptEmergencyRequest(reqId, reasonOrNote);
      } else if (activeModal.type === "reject") {
        await rejectEmergencyRequest(reqId, reasonOrNote || "Capacity full", optionalNote);
      } else if (activeModal.type === "complete") {
        await completeEmergencyRequest(reqId, reasonOrNote);
      }
    } finally {
      setIsActionSubmitting(false);
      setActiveModal(null);
    }
  };

  // Live Database Emergency Metrics
  const totalRequests = emergencyRequests.length;
  const countPending = emergencyRequests.filter((r) => r.status === "New" || r.status === "Pending" || r.rawStatus === "PENDING").length;
  const countUnderReview = emergencyRequests.filter((r) => r.status === "Under Review" || r.rawStatus === "UNDER_REVIEW").length;
  const countAccepted = emergencyRequests.filter((r) => r.status === "Accepted" || r.rawStatus === "ACCEPTED").length;
  const countRejected = emergencyRequests.filter((r) => r.status === "Cannot Accept" || r.rawStatus === "REJECTED").length;
  const countCompleted = emergencyRequests.filter((r) => r.status === "Completed" || r.rawStatus === "COMPLETED").length;

  // Live Bed Capacity Aggregation
  const totalBeds = (beds.general?.total || 0) + (beds.icu?.total || 0) + (beds.ventilators?.total || 0) + (beds.emergency?.total || 0);
  const availableBeds = (beds.general?.available || 0) + (beds.icu?.available || 0) + (beds.ventilators?.available || 0) + (beds.emergency?.available || 0);
  const occupiedBeds = (beds.general?.occupied || 0) + (beds.icu?.occupied || 0) + (beds.ventilators?.occupied || 0) + (beds.emergency?.occupied || 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // On-duty and on-call medical staff summary
  const onDutyCount = doctors.filter((d) => d.status === "On Duty" || d.status === "ON_DUTY").length;
  const onCallCount = doctors.filter((d) => d.status === "On Call" || d.status === "ON_CALL").length;

  // Find a cardiologist status
  const cardiologist = doctors.find((d) => d.specialty === "Cardiologist");
  const cardiologistStatus = cardiologist ? cardiologist.status : "On Call";

  // Recent incoming requests (top 4)
  const incomingPreview = emergencyRequests.slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Offline Demo Fallback Banner */}
      {!isBackendConnected && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde047",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1.25rem",
            color: "#92400e",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontWeight: 600
          }}
        >
          <ShieldAlert size={18} color="#d97706" />
          <span>Backend unavailable — showing demo data</span>
        </div>
      )}
      {/* Dashboard Top Header & Operational Readiness Bar */}
      <div
        className="card"
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, #0a192f 0%, #132743 100%)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 10px 25px -5px rgba(10, 25, 47, 0.35)"
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.25rem"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <span
                style={{
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em"
                }}
              >
                LIVE DASHBOARD
              </span>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                Emergency Coordination Desk
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.01em"
              }}
            >
              {hospital.name} — Emergency Dashboard
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginTop: "0.75rem", fontSize: "0.85rem", color: "#94a3b8" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="status-dot available" />
                <span style={{ color: "#ffffff", fontWeight: 600 }}>Hospital Status: {hospital.status}</span>
              </span>

              <span>•</span>

              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Clock size={14} color="#38bdf8" />
                <span>Last updated: <strong style={{ color: "#e2e8f0" }}>{hospital.lastUpdated}</strong></span>
              </span>

              <span>•</span>

              <span>
                Profile Completion: <strong style={{ color: "#4ade80" }}>{hospital.profileCompletion}%</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Button to Update Beds */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              to="/hospital-portal/availability"
              className="btn btn-primary"
              style={{
                backgroundColor: "var(--brand-blue)",
                fontWeight: 700,
                padding: "0.75rem 1.4rem"
              }}
            >
              <BedDouble size={18} />
              <span>Update Availability</span>
            </Link>

            <Link
              to="/hospital-portal/emergency-requests"
              className="btn btn-emergency"
              style={{
                fontWeight: 700,
                padding: "0.75rem 1.4rem"
              }}
            >
              <Siren size={18} />
              <span>Emergency Requests {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ""}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency Inflow & Triage Overview Metrics Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              Emergency Inflow & Triage Overview
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Real-time patient dispatches synchronized with MongoDB and active casualty desk.
            </p>
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: isBackendConnected ? "#059669" : "#d97706" }}>
            ● {isBackendConnected ? "Live Connected to Network" : "Local Prototype Mode"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem"
          }}
        >
          {/* Total Dispatches */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)"
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Dispatches
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)", marginTop: "0.25rem" }}>
              {totalRequests}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              All incoming cases
            </div>
          </div>

          {/* Pending / Immediate Action */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: countPending > 0 ? "1px solid #fca5a5" : "1px solid var(--border-light)",
              backgroundColor: countPending > 0 ? "#fef2f2" : "var(--bg-surface)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: countPending > 0 ? "#dc2626" : "var(--text-muted)", textTransform: "uppercase" }}>
                Pending
              </span>
              {countPending > 0 && (
                <span style={{ fontSize: "0.68rem", fontWeight: 800, backgroundColor: "#dc2626", color: "#ffffff", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                  ACTION REQ
                </span>
              )}
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: countPending > 0 ? "#dc2626" : "var(--brand-navy)", marginTop: "0.25rem" }}>
              {countPending}
            </div>
            <div style={{ fontSize: "0.75rem", color: countPending > 0 ? "#b91c1c" : "var(--text-muted)", marginTop: "0.25rem" }}>
              Awaiting desk review
            </div>
          </div>

          {/* Under Review */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)"
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Under Review
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0284c7", marginTop: "0.25rem" }}>
              {countUnderReview}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Evaluating capacity
            </div>
          </div>

          {/* Accepted / En Route */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)"
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Accepted
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#16a34a", marginTop: "0.25rem" }}>
              {countAccepted}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Trauma bay ready
            </div>
          </div>

          {/* Unable to Accept */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)"
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Cannot Accept
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#64748b", marginTop: "0.25rem" }}>
              {countRejected}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Capacity / rerouted
            </div>
          </div>

          {/* Completed */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)"
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Completed
            </div>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb", marginTop: "0.25rem" }}>
              {countCompleted}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Admitted / resolved
            </div>
          </div>
        </div>
      </div>

      {/* 4 Large Availability Summary Cards */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              Bed & Critical Resource Availability
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Reported capacity feeds directly to emergency family triage algorithms.
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            * Operational UI indicator, not a medical recommendation
          </span>
        </div>

        {/* Capacity Utilization Summary Bar */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1.25rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
            <span>
              Total Network Beds: <strong style={{ color: "var(--brand-navy)" }}>{totalBeds}</strong>
            </span>
            <span>
              Available: <strong style={{ color: "#16a34a" }}>{availableBeds}</strong>
            </span>
            <span>
              Occupied: <strong style={{ color: "#dc2626" }}>{occupiedBeds}</strong>
            </span>
            <span>
              Capacity Utilization: <strong style={{ color: occupancyRate > 85 ? "#dc2626" : occupancyRate > 60 ? "#d97706" : "#0284c7" }}>{occupancyRate}%</strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "140px", backgroundColor: "#e2e8f0", borderRadius: "9999px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, occupancyRate)}%`,
                  height: "100%",
                  backgroundColor: occupancyRate > 85 ? "#dc2626" : occupancyRate > 60 ? "#f59e0b" : "#10b981",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <Link to="/hospital-portal/availability" style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brand-blue)" }}>
              Edit Beds →
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem"
          }}
        >
          {/* General Beds */}
          <AvailabilityCard
            title="General Beds"
            subtitle="Standard emergency admission"
            icon={BedDouble}
            total={beds.general.total}
            occupied={beds.general.occupied}
            available={beds.general.available}
            lastUpdated={hospital.lastUpdated}
            iconBg="#f0fdf4"
            iconColor="#16a34a"
          />

          {/* ICU */}
          <AvailabilityCard
            title="ICU"
            subtitle="Intensive Care Unit (Level 3)"
            icon={Activity}
            total={beds.icu.total}
            occupied={beds.icu.occupied}
            available={beds.icu.available}
            lastUpdated={hospital.lastUpdated}
            iconBg="#e0f2fe"
            iconColor="#0284c7"
          />

          {/* Ventilators */}
          <AvailabilityCard
            title="Ventilators"
            subtitle="Invasive & mechanical support"
            icon={Wind}
            total={beds.ventilators.total}
            occupied={beds.ventilators.occupied}
            available={beds.ventilators.available}
            lastUpdated={hospital.lastUpdated}
            iconBg="#eff6ff"
            iconColor="#3b82f6"
          />

          {/* Emergency Beds */}
          <AvailabilityCard
            title="Emergency Beds"
            subtitle="Trauma & triage resuscitation bays"
            icon={ShieldAlert}
            total={beds.emergency.total}
            occupied={beds.emergency.occupied}
            available={beds.emergency.available}
            lastUpdated={hospital.lastUpdated}
            iconBg="#fef2f2"
            iconColor="#dc2626"
          />
        </div>
      </div>

      {/* Emergency Readiness Panel */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "0.85rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <HeartPulse size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)", lineHeight: 1.2 }}>
                Emergency Readiness
              </h2>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Core hospital operational readiness indicators for emergency coordination
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <Clock size={14} />
            <span>Last verified: <strong style={{ color: "var(--brand-navy)" }}>{hospital.lastUpdated}</strong></span>
          </div>
        </div>

        {/* Readiness Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem"
          }}
        >
          {/* ICU */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>ICU</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--brand-navy)" }}>
                {beds.icu.available} Available
              </span>
              <AvailabilityStatus available={beds.icu.available} total={beds.icu.total} size="sm" />
            </div>
          </div>

          {/* Ventilator */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Ventilator</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--brand-navy)" }}>
                {beds.ventilators.available} Available
              </span>
              <AvailabilityStatus available={beds.ventilators.available} total={beds.ventilators.total} size="sm" />
            </div>
          </div>

          {/* Cardiologist */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Cardiologist</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand-navy)" }}>
                {cardiologistStatus}
              </span>
              <span
                className={`badge-status ${
                  cardiologistStatus === "On Duty" || cardiologistStatus === "On Call"
                    ? "badge-available"
                    : "badge-unavailable"
                }`}
                style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem" }}
              >
                <span className="status-dot available" />
                <span>{cardiologistStatus}</span>
              </span>
            </div>
          </div>

          {/* Emergency Beds */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Emergency Beds</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--brand-navy)" }}>
                {beds.emergency.available} Available
              </span>
              <AvailabilityStatus available={beds.emergency.available} total={beds.emergency.total} size="sm" />
            </div>
          </div>

          {/* Operation Theatre */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Operation Theatre</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--brand-navy)" }}>
                {operationTheatre.activeCount} Active OTs
              </span>
              <AvailabilityStatus customStatus={operationTheatre.available ? "Available" : "Unavailable"} size="sm" />
            </div>
          </div>

          {/* Blood Bank */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Blood Bank</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--brand-navy)" }}>
                {bloodBank.status}
              </span>
              <AvailabilityStatus customStatus={bloodBank.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Live Specialist On-Duty Roster Strip */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#f8fafc",
            border: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users2 size={16} color="var(--brand-blue)" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              Medical Specialists ({onDutyCount} On Duty, {onCallCount} On Call):
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {doctors.slice(0, 6).map((doc) => {
              const isOnDuty = doc.status === "On Duty" || doc.status === "ON_DUTY";
              const isOnCall = doc.status === "On Call" || doc.status === "ON_CALL";
              return (
                <span
                  key={doc.id || doc.name}
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "9999px",
                    backgroundColor: isOnDuty ? "#dcfce7" : isOnCall ? "#e0f2fe" : "#f1f5f9",
                    color: isOnDuty ? "#166534" : isOnCall ? "#0369a1" : "#64748b",
                    border: `1px solid ${isOnDuty ? "#bbf7d0" : isOnCall ? "#bae6fd" : "#e2e8f0"}`
                  }}
                >
                  {doc.specialty}: {doc.name.replace("Dr. ", "")} ({doc.status})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards & Incoming Emergency Requests Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Incoming Emergency Requests Preview with Action Controls */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Siren size={20} color="var(--emergency-red)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)" }}>
                  Recent Emergency Queue
                </h3>
              </div>

              <Link
                to="/hospital-portal/emergency-requests"
                style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--brand-blue)" }}
              >
                View All ({emergencyRequests.length}) →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {incomingPreview.length === 0 ? (
                <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  <span>No active emergency requests in queue. Casualty desk is on standby.</span>
                </div>
              ) : (
                incomingPreview.map((req) => {
                  const directionsUrl = getDirectionsUrl(req.location);
                  const isPending = req.status === "New" || req.status === "Pending" || req.rawStatus === "PENDING";
                  const isUnderReview = req.status === "Under Review" || req.rawStatus === "UNDER_REVIEW";
                  const isAccepted = req.status === "Accepted" || req.rawStatus === "ACCEPTED";
                  const isActionable = isPending || isUnderReview;

                  return (
                    <div
                      key={req.id}
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.85rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.9rem", color: "var(--brand-navy)" }}>#{req.id}</strong>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600 }}>• {req.emergencyType}</span>
                          </div>
                          {req.reportedComplaint && (
                            <div style={{ fontSize: "0.78rem", color: "#334155", marginTop: "2px" }}>
                              Complaint: <em>"{req.reportedComplaint}"</em>
                            </div>
                          )}
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            ETA {req.estimatedArrival || "15 min"} • Age: {req.patientAge || req.age || "N/A"} ({req.patientGender || "N/A"})
                          </div>
                        </div>

                        <span
                          className={`badge-status ${
                            isAccepted
                              ? "badge-available"
                              : req.status === "Cannot Accept"
                              ? "badge-unavailable"
                              : "badge-limited"
                          }`}
                          style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", flexShrink: 0 }}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Location and Map Navigation Strip */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.76rem", color: "var(--text-muted)", flexWrap: "wrap", gap: "0.4rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Navigation size={12} color="var(--brand-teal)" />
                          <span>{req.locationInfo?.displayText || (typeof req.location === "object" ? req.location?.address || "GPS Location" : req.location || "Pune")}</span>
                          {req.locationInfo?.hasCoordinates && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, backgroundColor: "#dcfce7", color: "#166534", padding: "1px 4px", borderRadius: "3px" }}>
                              GPS
                            </span>
                          )}
                        </span>

                        {directionsUrl && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--brand-blue)", fontWeight: 600, textDecoration: "none" }}
                          >
                            <span>Google Maps</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {/* Direct Action Buttons on Dashboard */}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap", borderTop: "1px dashed var(--border-light)", paddingTop: "0.5rem" }}>
                        {isActionable && (
                          <>
                            <button
                              onClick={() => handleOpenAcceptModal(req)}
                              disabled={isActionSubmitting}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#16a34a",
                                color: "#ffffff",
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                borderRadius: "4px"
                              }}
                            >
                              <Check size={12} strokeWidth={3} />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              disabled={isActionSubmitting}
                              className="btn btn-sm btn-outline"
                              style={{
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#dc2626",
                                borderColor: "#fca5a5",
                                borderRadius: "4px"
                              }}
                            >
                              <X size={12} strokeWidth={2.5} />
                              <span>Decline</span>
                            </button>

                            {isPending && (
                              <button
                                onClick={() => handleOpenReviewModal(req)}
                                disabled={isActionSubmitting}
                                className="btn btn-sm btn-ghost"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  color: "#0284c7"
                                }}
                              >
                                Review
                              </button>
                            )}
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => handleOpenCompleteModal(req)}
                            disabled={isActionSubmitting}
                            className="btn btn-sm btn-outline"
                            style={{
                              padding: "0.25rem 0.65rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#2563eb",
                              borderColor: "#bfdbfe",
                              borderRadius: "4px"
                            }}
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-light)" }}>
            <Link
              to="/hospital-portal/emergency-requests"
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>Manage All Emergency Requests</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Operations Shortcuts */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "1rem" }}>
            Operational Management Hub
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              to="/hospital-portal/doctors"
              className="card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-surface)",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Users2 size={18} color="var(--brand-blue)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--brand-navy)" }}>
                    Doctor & Specialist Roster
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {doctors.length} specialists listed • {onDutyCount} On Duty
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              to="/hospital-portal/facilities"
              className="card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-surface)",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Building2 size={18} color="var(--brand-teal)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--brand-navy)" }}>
                    Facilities & Equipment Units
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    OT, CT Scan, MRI, Blood Bank, NICU, Dialysis
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              to="/hospital-portal/costs"
              className="card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-surface)",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <DollarSign size={18} color="#d97706" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--brand-navy)" }}>
                    Estimated Costs & Insurance Schemes
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Bed tariffs, consultation charges & empaneled TPAs
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Dashboard Actions */}
      <ConfirmModal
        isOpen={Boolean(activeModal)}
        type={activeModal?.type}
        requestData={activeModal?.request}
        onConfirm={handleModalConfirm}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
