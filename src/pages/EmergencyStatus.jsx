import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Phone,
  MapPin,
  Navigation,
  ShieldAlert,
  Building2,
  HeartPulse,
  Activity,
  Check,
  Loader2,
  AlertTriangle
} from "lucide-react";
import api from "../services/api";
import { useEmergency } from "../context/EmergencyContext";
import { subscribeToPatientStatus } from "../services/socket";
import PatientLocationMap from "../components/PatientLocationMap";
import { getLocationInfo, formatCoordinates } from "../utils/locationHelper";

export default function EmergencyStatus() {
  const { requestId } = useParams();
  const { openCallModal, openDirectionsModal } = useEmergency();

  const [request, setRequest] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponsesLoading, setIsResponsesLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [responsesError, setResponsesError] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

// Guard against stale polling data overwriting accepted emergency requests
function mergeRequestData(prevReq, newReq) {
  if (!prevReq) return newReq;
  if (!newReq) return prevReq;

  const prevStatus = (prevReq.status || "").toUpperCase();
  const newStatus = (newReq.status || "").toUpperCase();

  // If already ACCEPTED or COMPLETED, do not allow an older poll returning PENDING or UNDER_REVIEW to downgrade it
  if ((prevStatus === "ACCEPTED" || prevStatus === "COMPLETED") && (newStatus === "PENDING" || newStatus === "UNDER_REVIEW")) {
    console.warn("Protected accepted emergency request from stale polling packet");
    return {
      ...newReq,
      status: prevReq.status,
      hospitalResponse: prevReq.hospitalResponse || newReq.hospitalResponse,
      confirmedHospital: prevReq.confirmedHospital || newReq.confirmedHospital,
      responseNote: prevReq.responseNote || newReq.responseNote,
      responseTimestamp: prevReq.responseTimestamp || newReq.responseTimestamp
    };
  }

  // Compare timestamps if available
  const prevTime = prevReq.updatedAt ? new Date(prevReq.updatedAt).getTime() : 0;
  const newTime = newReq.updatedAt ? new Date(newReq.updatedAt).getTime() : 0;
  if (prevTime > 0 && newTime > 0 && newTime < prevTime && (prevStatus === "ACCEPTED" || prevStatus === "COMPLETED")) {
    console.warn("Ignored stale request payload with older timestamp");
    return prevReq;
  }

  return newReq;
}

// Guard against stale hospital response overwriting an accepted hospital state
function mergeHospitalResponses(prevResponses, newResponses) {
  if (!prevResponses || prevResponses.length === 0) return newResponses || [];
  if (!newResponses || newResponses.length === 0) return prevResponses;

  return newResponses.map((newResp) => {
    const prevResp = prevResponses.find(
      (pr) => String(pr.hospitalId) === String(newResp.hospitalId)
    );
    if (!prevResp) return newResp;

    const prevStat = (prevResp.responseStatus || "").toUpperCase();
    const newStat = (newResp.responseStatus || "").toUpperCase();

    // Prevent regressing an individual hospital from ACCEPTED to PENDING/UNDER_REVIEW
    if ((prevStat === "ACCEPTED" || prevStat === "COMPLETED") && (newStat === "PENDING" || newStat === "UNDER_REVIEW")) {
      console.warn(`Protected Hospital ${newResp.hospitalName} ACCEPTED status from stale poll regression`);
      return {
        ...newResp,
        responseStatus: prevResp.responseStatus,
        responseNote: prevResp.responseNote || newResp.responseNote,
        responseTimestamp: prevResp.responseTimestamp || newResp.responseTimestamp,
        updatedAt: prevResp.updatedAt || newResp.updatedAt
      };
    }

    return newResp;
  });
}

  // Polling ref and in-flight guard
  const pollingRef = useRef(null);
  const isFetchingRef = useRef(false);
  const requestRef = useRef(request);
  const responsesRef = useRef(responses);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  // Fetch request status & hospital responses from backend
  const fetchStatus = useCallback(
    async (isManualRefresh = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (isManualRefresh) setIsRefreshing(true);
      setErrorMessage(null);
      setResponsesError(null);

      // 1. Fetch primary emergency request
      try {
        const res = await api.getEmergencyRequest(requestId);
        if (res && res.success && res.data) {
          setRequest((prev) => mergeRequestData(prev, res.data));
          setIsLiveBackend(true);
          setLastRefreshedAt(new Date());

          if (Array.isArray(res.data.hospitalResponses) && res.data.hospitalResponses.length > 0) {
            setResponses((prev) => mergeHospitalResponses(prev, res.data.hospitalResponses));
          }
        } else {
          throw new Error(res?.message || "Invalid status response");
        }
      } catch (err) {
        console.warn(`Fetch emergency request #${requestId} failed:`, err.message);

        // Do not fabricate fake patient data for non-existent requests
        setIsLiveBackend(false);
        const notFoundMsg =
          err?.status === 404
            ? `Emergency request #${requestId} was not found in the casualty registry.`
            : "Unable to retrieve the latest emergency status. Please try again.";
        setErrorMessage(notFoundMsg);
      } finally {
        setIsLoading(false);
      }

      // 2. Fetch patient-safe hospital responses list
      try {
        const respRes = await api.getEmergencyResponses(requestId);
        if (respRes && respRes.success && Array.isArray(respRes.data)) {
          setResponses((prev) => mergeHospitalResponses(prev, respRes.data));
          setResponsesError(null);
        }
      } catch (respErr) {
        console.warn(`Fetch responses for request #${requestId} failed:`, respErr.message);
        const currentReq = requestRef.current;
        if (currentReq?.hospitalResponses && currentReq.hospitalResponses.length > 0) {
          setResponses((prev) => mergeHospitalResponses(prev, currentReq.hospitalResponses));
        } else {
          setResponsesError("Unable to retrieve the latest hospital responses.");
        }
      } finally {
        setIsResponsesLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [requestId]
  );

  // Initial load
  useEffect(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  // Polling management: automatically refresh every 4 seconds while active
  // IMPORTANT: If at least one hospital is still PENDING or UNDER_REVIEW, continue polling.
  // Polling only stops when all hospital responses reach terminal states (ACCEPTED or REJECTED)
  useEffect(() => {
    if (!request) return;

    const currentStatus = (request.status || "").toUpperCase();

    // Check multi-hospital responses
    const hasActiveHospital = responses.some((r) => {
      const s = (r.responseStatus || "").toUpperCase();
      return s === "PENDING" || s === "UNDER_REVIEW";
    });

    const allHospitalsTerminal =
      responses.length > 0 &&
      responses.every((r) => {
        const s = (r.responseStatus || "").toUpperCase();
        return s === "ACCEPTED" || s === "REJECTED";
      });

    const isGlobalTerminal = currentStatus === "COMPLETED" || currentStatus === "CANCELLED";

    if (isGlobalTerminal || (responses.length > 0 && allHospitalsTerminal && !hasActiveHospital)) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Active polling for ongoing responses
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchStatus(false);
      }, 4000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [request, responses, fetchStatus]);

  // Phase C: Real-Time Socket.IO Subscription with automatic polling fallback
  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = subscribeToPatientStatus(requestId, (event) => {
      setLastRefreshedAt(new Date());
      setIsLiveBackend(true);

      if (event.status) {
        setRequest((prev) => {
          if (!prev) return prev;
          return mergeRequestData(prev, {
            ...prev,
            status: event.status,
            hospitalResponse: event.hospitalResponse || prev.hospitalResponse,
            confirmedHospital: event.confirmedHospital || prev.confirmedHospital,
            responseNote: event.hospitalResponse?.responseNote || prev.responseNote,
            updatedAt: new Date().toISOString()
          });
        });
      }

      if (Array.isArray(event.hospitalResponses) && event.hospitalResponses.length > 0) {
        setResponses((prev) => mergeHospitalResponses(prev, event.hospitalResponses));
      } else if (event.hospitalResponse) {
        setResponses((prev) => {
          const updated = prev.map((h) =>
            String(h.hospitalId) === String(event.hospitalId || event.hospitalResponse?.hospitalId)
              ? { ...h, ...event.hospitalResponse }
              : h
          );
          return mergeHospitalResponses(prev, updated);
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [requestId]);

  // Status configuration details
  const getStatusConfig = (status) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "UNDER_REVIEW":
        return {
          title: "Hospital is Reviewing the Request",
          badgeLabel: "UNDER REVIEW",
          badgeClass: "badge-limited",
          color: "#0284c7",
          bgColor: "#f0f9ff",
          borderColor: "#bae6fd",
          icon: <Activity size={22} className="spin" color="#0284c7" />,
          description:
            "A casualty physician or triage coordinator has opened this request and is verifying bed availability and on-duty specialists."
        };
      case "ACCEPTED":
        return {
          title: "Hospital Confirmed",
          badgeLabel: "CONFIRMED & ACCEPTED",
          badgeClass: "badge-available",
          color: "#16a34a",
          bgColor: "#f0fdf4",
          borderColor: "#bbf7d0",
          icon: <CheckCircle2 size={24} color="#16a34a" />,
          description:
            "The hospital has confirmed operational capacity for this case. Critical care team notified."
        };
      case "REJECTED":
        return {
          title: "Hospital Cannot Accept",
          badgeLabel: "CANNOT ACCEPT",
          badgeClass: "badge-unavailable",
          color: "#dc2626",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
          icon: <XCircle size={24} color="#dc2626" />,
          description:
            "The hospital reported that they cannot accept this case at this time due to current capacity or specialist availability."
        };
      case "COMPLETED":
        return {
          title: "Emergency Coordination Completed",
          badgeLabel: "COMPLETED",
          badgeClass: "badge-available",
          color: "#0d9488",
          bgColor: "#f0fdfa",
          borderColor: "#99f6e4",
          icon: <Check size={24} color="#0d9488" strokeWidth={3} />,
          description: "Emergency coordination successfully completed. Patient transfer/admission recorded."
        };
      case "PENDING":
      default:
        return {
          title: "Request Submitted — Waiting for Hospital Response",
          badgeLabel: "PENDING RESPONSE",
          badgeClass: "badge-limited",
          color: "#d97706",
          bgColor: "#fffbeb",
          borderColor: "#fef3c7",
          icon: <Clock size={22} color="#d97706" />,
          description:
            "Emergency request registered and dispatched to hospital casualty triage desks. Awaiting hospital review."
        };
    }
  };

  const statusConfig = getStatusConfig(request?.status);

  // Timeline Step States
  const s = (request?.status || "PENDING").toUpperCase();
  const timelineSteps = [
    {
      id: 1,
      title: "Request Submitted",
      description: "Patient emergency request registered into triage queue",
      timestamp: request?.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Completed",
      state: "completed"
    },
    {
      id: 2,
      title: "Hospital Reviewing",
      description: "Casualty triage coordinator reviewing capacity and specialists",
      timestamp:
        s === "UNDER_REVIEW" || s === "ACCEPTED" || s === "REJECTED" || s === "COMPLETED"
          ? request?.updatedAt
            ? new Date(request.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "In progress"
          : null,
      state:
        s === "UNDER_REVIEW"
          ? "current"
          : ["ACCEPTED", "REJECTED", "COMPLETED"].includes(s)
          ? "completed"
          : "pending"
    },
    {
      id: 3,
      title: "Hospital Response",
      description: "Facility confirms readiness or reports operational constraints",
      timestamp:
        s === "ACCEPTED" || s === "REJECTED" || s === "COMPLETED"
          ? request?.hospitalResponse?.timestamp || request?.responseTimestamp || request?.updatedAt
            ? new Date(
                request?.hospitalResponse?.timestamp ||
                  request?.responseTimestamp ||
                  request?.updatedAt
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Received"
          : null,
      state:
        ["ACCEPTED", "REJECTED", "COMPLETED"].includes(s)
          ? "completed"
          : s === "UNDER_REVIEW"
          ? "pending"
          : "pending"
    },
    {
      id: 4,
      title: s === "REJECTED" ? "Cannot Accept" : "Hospital Confirmed",
      description:
        s === "REJECTED"
          ? request?.rejectionReason || "Facility unable to admit at this time"
          : s === "ACCEPTED" || s === "COMPLETED"
          ? "Hospital reserved triage and prepared care team"
          : "Pending confirmation or alternate triage routing",
      timestamp:
        s === "ACCEPTED" || s === "REJECTED" || s === "COMPLETED"
          ? request?.responseTimestamp || request?.updatedAt
            ? new Date(request.responseTimestamp || request.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            : null
          : null,
      state:
        s === "ACCEPTED" || s === "COMPLETED"
          ? "completed"
          : s === "REJECTED"
          ? "rejected"
          : "pending"
    },
    {
      id: 5,
      title: "Completed",
      description: "Emergency coordination finalized at hospital casualty desk",
      timestamp: s === "COMPLETED" ? new Date(request.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
      state: s === "COMPLETED" ? "completed" : "pending"
    }
  ];

  // Confirmed hospital object
  const confirmedHosp =
    request?.confirmedHospital ||
    (request?.hospitalResponse && request?.status === "ACCEPTED"
      ? {
          name: request.hospitalResponse.hospitalName || "Care Hospital Pune",
          address: request.hospitalResponse.hospitalAddress || "Plot 14, Senapati Bapat Road, Shivajinagar, Pune",
          phone: request.hospitalResponse.hospitalPhone || "+91 20 2567 8900",
          emergencyPhone: request.hospitalResponse.hospitalEmergencyPhone || "+91 20 2567 8999"
        }
      : null);

  // Response counts calculated from live API responses data
  const acceptedResponses = responses.filter(
    (r) => (r.responseStatus || "").toUpperCase() === "ACCEPTED"
  );
  const underReviewResponses = responses.filter(
    (r) => (r.responseStatus || "").toUpperCase() === "UNDER_REVIEW"
  );
  const pendingResponses = responses.filter(
    (r) => (r.responseStatus || "").toUpperCase() === "PENDING"
  );
  const rejectedResponses = responses.filter(
    (r) => (r.responseStatus || "").toUpperCase() === "REJECTED"
  );

  const acceptedCount = acceptedResponses.length;
  const underReviewCount = underReviewResponses.length;
  const pendingCount = pendingResponses.length;
  const rejectedCount = rejectedResponses.length;
  const totalContacted = responses.length;

  return (
    <div style={{ padding: "2.5rem 0 5rem", backgroundColor: "var(--bg-page)", minHeight: "85vh" }}>
      <div className="container-narrow">
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link
            to="/hospitals"
            className="btn btn-ghost btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.6rem" }}
          >
            <span>← View Hospital Directory</span>
          </Link>

          {/* Live vs Offline Status Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.78rem",
                fontWeight: 600,
                backgroundColor: isLiveBackend ? "#dcfce7" : "#fef3c7",
                color: isLiveBackend ? "#166534" : "#92400e",
                border: `1px solid ${isLiveBackend ? "#bbf7d0" : "#fde68a"}`
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isLiveBackend ? "#16a34a" : "#d97706",
                  boxShadow: isLiveBackend ? "0 0 6px rgba(22, 163, 74, 0.6)" : "none"
                }}
              />
              <span>{isLiveBackend ? "LIVE BACKEND DATA" : "OFFLINE / DEMO DATA"}</span>
            </span>

            {/* Last Updated Timestamp & Refresh Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {lastRefreshedAt && (
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Clock size={12} color="var(--brand-blue)" />
                  <span>Updated {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                </span>
              )}
              <button
                onClick={() => fetchStatus(true)}
                disabled={isRefreshing}
                className="btn btn-outline btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
                title="Poll latest request status from backend"
                id="manual-refresh-status-btn"
              >
                <RotateCcw size={13} className={isRefreshing ? "spin" : ""} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backend Error / Offline Notice */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#92400e", fontSize: "0.9rem" }}>
              <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchStatus(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.8rem" }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading state skeleton */}
        {isLoading && !request ? (
          <div
            className="card"
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Loader2 size={40} color="var(--brand-blue)" className="spin" style={{ marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.25rem", color: "var(--brand-navy)" }}>Retrieving Emergency Request Status...</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
              Querying hospital casualty triage registry for Request #{requestId}
            </p>
          </div>
        ) : !request ? (
          <div
            id="emergency-not-found-card"
            className="card"
            style={{
              padding: "3.5rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem"
            }}
          >
            <AlertTriangle size={48} color="#dc2626" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              Emergency Request Not Found
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "480px" }}>
              Request #{requestId} could not be found in the casualty registry. It may have been cleared or the ID may be invalid.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => fetchStatus(true)}
                disabled={isRefreshing}
                className="btn btn-outline btn-sm"
              >
                <RotateCcw size={15} className={isRefreshing ? "spin" : ""} />
                <span>Retry Connection</span>
              </button>
              <Link to="/emergency" className="btn btn-primary btn-sm">
                Submit Emergency Request
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Status Hero Card */}
            <div
              className="card"
              style={{
                padding: "2rem",
                borderTop: `6px solid ${statusConfig.color}`,
                backgroundColor: "#ffffff",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "1.25rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "var(--brand-blue)",
                        backgroundColor: "var(--brand-blue-subtle)",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                        letterSpacing: "0.03em"
                      }}
                    >
                      REQUEST ID: #{request?.id || requestId}
                    </span>
                    {request?.createdAt && (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} />
                        <span>Submitted {new Date(request.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", color: "var(--brand-navy)", fontWeight: 800, margin: 0 }}>
                    {statusConfig.title}
                  </h1>
                </div>

                {/* Status Badge */}
                <div
                  className={`badge-status ${statusConfig.badgeClass}`}
                  style={{
                    padding: "0.45rem 1.1rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    gap: "0.5rem",
                    boxShadow: "var(--shadow-xs)"
                  }}
                >
                  {statusConfig.icon}
                  <span>{statusConfig.badgeLabel}</span>
                </div>
              </div>

              {/* Status Explanation Box */}
              <div
                style={{
                  backgroundColor: statusConfig.bgColor,
                  border: `1.5px solid ${statusConfig.borderColor}`,
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  color: "var(--brand-navy)",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  marginBottom: "1.25rem"
                }}
              >
                {statusConfig.description}
              </div>

              {/* Patient & Care Requirement Summary Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-light)",
                  fontSize: "0.85rem"
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Patient</div>
                  <div style={{ fontWeight: 700, color: "var(--brand-navy)", fontSize: "0.95rem" }}>
                    {request?.patientName || "Anonymous Patient"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {request?.patientAge ? `${request.patientAge} yrs` : ""} • {request?.patientGender || "Unspecified"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Emergency Type</div>
                  <div style={{ fontWeight: 700, color: "var(--emergency-red)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <HeartPulse size={15} />
                    <span>{request?.emergencyType || "General Emergency"}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {getLocationInfo(request?.location).displayText}
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Required Care</div>
                  <div style={{ fontWeight: 600, color: "var(--brand-navy)", fontSize: "0.9rem" }}>
                    {Array.isArray(request?.requiredFacility) && request.requiredFacility.length > 0
                      ? request.requiredFacility.join(", ")
                      : request?.requiredSpecialist || "Emergency Care"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    Bed Type: {request?.requiredBedType || "Normal"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Last Updated</div>
                  <div style={{ fontWeight: 600, color: "var(--brand-navy)", fontSize: "0.9rem" }}>
                    {request?.updatedAt ? new Date(request.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {lastRefreshedAt ? `Polled ${lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                  </div>
                </div>
              </div>

              {/* Patient Location Map Preview if Coordinates were provided */}
              {getLocationInfo(request?.location).hasCoordinates && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-light, #e2e8f0)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <MapPin size={15} color="#dc2626" />
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-navy)" }}>
                        Shared Emergency Location:
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                        {formatCoordinates(getLocationInfo(request?.location).latitude, getLocationInfo(request?.location).longitude)}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600, backgroundColor: "#f0fdf4", padding: "0.15rem 0.45rem", borderRadius: "4px", border: "1px solid #bbf7d0" }}>
                      ✓ Transmitted to responding hospital
                    </span>
                  </div>
                  <PatientLocationMap
                    latitude={getLocationInfo(request?.location).latitude}
                    longitude={getLocationInfo(request?.location).longitude}
                    address={getLocationInfo(request?.location).address}
                    source={getLocationInfo(request?.location).source}
                    height="180px"
                    showDirectionsButton={true}
                    directionsLabel="Open Google Directions"
                  />
                </div>
              )}
            </div>

            {/* ========================================================
                HOSPITAL RESPONSES SUMMARY SECTION
                ======================================================== */}
            <div
              className="card"
              style={{
                padding: "1.25rem 1.5rem",
                backgroundColor: "#ffffff",
                boxShadow: "var(--shadow-sm)",
                borderLeft: "5px solid var(--brand-blue)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginBottom: "1rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
                      Hospital Responses
                    </h2>
                    {totalContacted > 0 && (
                      <span
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "var(--brand-navy)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "var(--radius-full)"
                        }}
                      >
                        {totalContacted} {totalContacted === 1 ? "hospital" : "hospitals"} contacted
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                    Independent live casualty responses from all contacted hospitals.
                  </p>
                </div>
              </div>

              {/* Status Counts Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "0.75rem"
                }}
              >
                {/* Accepted */}
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                    Accepted
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
                    {acceptedCount}
                  </span>
                </div>

                {/* Under Review */}
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase" }}>
                    Under Review
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0284c7", lineHeight: 1 }}>
                    {underReviewCount}
                  </span>
                </div>

                {/* Pending */}
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fef3c7",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>
                    Pending
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#d97706", lineHeight: 1 }}>
                    {pendingCount}
                  </span>
                </div>

                {/* Rejected */}
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>
                    Rejected
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>
                    {rejectedCount}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================
                DETAILED HOSPITAL RESPONSES CARDS SECTION
                ======================================================== */}
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
                  Hospital Response Details
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  Every contacted hospital manages and reports its own triage capacity independently.
                </p>
              </div>

              {responsesError && (
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fef3c7",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    color: "#92400e",
                    fontSize: "0.9rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertTriangle size={18} color="#d97706" />
                    <span>{responsesError}</span>
                  </div>
                  <button
                    onClick={() => fetchStatus(true)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {isResponsesLoading && responses.length === 0 ? (
                <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                  <Loader2 size={32} className="spin" color="var(--brand-blue)" style={{ margin: "0 auto 0.75rem" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
                    Loading hospital responses...
                  </p>
                </div>
              ) : responses.length === 0 ? (
                /* Fallback when no multi-hospital responses exist (e.g. legacy Part 4A request) */
                s === "ACCEPTED" && confirmedHosp ? (
                  <div
                    className="card"
                    style={{
                      padding: "1.75rem",
                      borderLeft: "6px solid var(--status-available)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 16px rgba(22, 163, 74, 0.12)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: "#dcfce7",
                          color: "#16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#16a34a", letterSpacing: "0.03em" }}>
                          CONFIRMED ACCEPTING HOSPITAL
                        </span>
                        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>
                          {confirmedHosp.name}
                        </h2>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "1rem 1.25rem",
                        marginBottom: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <MapPin size={17} color="#0d9488" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div><strong>Address:</strong> {confirmedHosp.address}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Phone size={17} color="#dc2626" style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Emergency Hotline:</strong>{" "}
                          <a href={`tel:${confirmedHosp.emergencyPhone || confirmedHosp.phone}`} style={{ color: "#dc2626", fontWeight: 700 }}>
                            {confirmedHosp.emergencyPhone || confirmedHosp.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      <button
                        onClick={() => openCallModal(confirmedHosp)}
                        className="btn btn-emergency btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.9rem" }}
                      >
                        <Phone size={16} />
                        <span>Call Casualty Desk</span>
                      </button>
                      <button
                        onClick={() => openDirectionsModal(confirmedHosp)}
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.9rem" }}
                      >
                        <Navigation size={16} />
                        <span>Get GPS Directions</span>
                      </button>
                    </div>
                  </div>
                ) : s === "REJECTED" ? (
                  <div
                    className="card"
                    style={{
                      padding: "1.75rem",
                      borderLeft: "6px solid var(--status-unavailable)",
                      backgroundColor: "#ffffff",
                      boxShadow: "var(--shadow-sm)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                      <XCircle size={24} color="#dc2626" />
                      <div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#dc2626" }}>STATUS: HOSPITAL CANNOT ACCEPT</span>
                        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>Reported Capacity Constraint</h2>
                      </div>
                    </div>
                    <div style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", color: "#991b1b", fontSize: "0.92rem", marginBottom: "1rem" }}>
                      <strong>Reported Reason:</strong> {request?.rejectionReason || "Hospital reported capacity full."}
                    </div>
                    <Link to="/hospitals" className="btn btn-primary btn-sm">
                      Find Alternative Hospitals
                    </Link>
                  </div>
                ) : (
                  <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "1rem" }}>
                      No hospitals have been dispatched yet for this emergency request.
                    </p>
                    <Link to="/emergency" className="btn btn-primary btn-sm">
                      Contact Hospitals
                    </Link>
                  </div>
                )
              ) : (
                /* Multi-Hospital Response Grid */
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "1.25rem"
                  }}
                >
                  {responses.map((hr, idx) => {
                    const status = (hr.responseStatus || "PENDING").toUpperCase();
                    const isAccepted = status === "ACCEPTED";
                    const isUnderReview = status === "UNDER_REVIEW";
                    const isRejected = status === "REJECTED";
                    const isPending = status === "PENDING";

                    let borderLeftColor = "#94a3b8";
                    let badgeBg = "#f1f5f9";
                    let badgeColor = "#475569";
                    let badgeLabel = "Waiting for response";

                    if (isAccepted) {
                      borderLeftColor = "#16a34a";
                      badgeBg = "#dcfce7";
                      badgeColor = "#166534";
                      badgeLabel = "Hospital Confirmed";
                    } else if (isUnderReview) {
                      borderLeftColor = "#0284c7";
                      badgeBg = "#f0f9ff";
                      badgeColor = "#0369a1";
                      badgeLabel = "Hospital is reviewing";
                    } else if (isRejected) {
                      borderLeftColor = "#dc2626";
                      badgeBg = "#fee2e2";
                      badgeColor = "#991b1b";
                      badgeLabel = "Hospital Declined";
                    }

                    return (
                      <div
                        key={hr.hospitalId || idx}
                        className="card"
                        style={{
                          padding: "1.5rem",
                          borderLeft: `5px solid ${borderLeftColor}`,
                          backgroundColor: "#ffffff",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          {/* Card Header: Hospital Name & Status Badge */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                              marginBottom: "0.85rem"
                            }}
                          >
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
                              {hr.hospitalName}
                            </h3>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.25rem 0.65rem",
                                borderRadius: "var(--radius-full)",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                backgroundColor: badgeBg,
                                color: badgeColor
                              }}
                            >
                              {isAccepted && <CheckCircle2 size={13} />}
                              {isUnderReview && <Activity size={13} className="spin" />}
                              {isRejected && <XCircle size={13} />}
                              {isPending && <Clock size={13} />}
                              <span>{badgeLabel}</span>
                            </span>
                          </div>

                          {/* Address & Contacts */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                              fontSize: "0.85rem",
                              color: "var(--text-main)",
                              marginBottom: "1rem"
                            }}
                          >
                            {(hr.hospitalAddress || hr.address) && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem" }}>
                                <MapPin size={15} color="#0d9488" style={{ flexShrink: 0, marginTop: "2px" }} />
                                <span>{hr.hospitalAddress || hr.address}</span>
                              </div>
                            )}

                            {(hr.hospitalEmergencyPhone || hr.emergencyPhone) && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                                <Phone size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                                <span>
                                  <strong>Emergency:</strong>{" "}
                                  <a href={`tel:${hr.hospitalEmergencyPhone || hr.emergencyPhone}`} style={{ color: "#dc2626", fontWeight: 700 }}>
                                    {hr.hospitalEmergencyPhone || hr.emergencyPhone}
                                  </a>
                                </span>
                              </div>
                            )}

                            {hr.hospitalPhone && hr.hospitalPhone !== (hr.hospitalEmergencyPhone || hr.emergencyPhone) && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                <Phone size={13} />
                                <span>Phone: {hr.hospitalPhone}</span>
                              </div>
                            )}
                          </div>

                          {/* Status-specific Response Body */}
                          {isAccepted && (
                            <div
                              style={{
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.75rem 0.9rem",
                                marginBottom: "1rem",
                                fontSize: "0.85rem"
                              }}
                            >
                              <div style={{ fontWeight: 600, color: "#166534", marginBottom: "0.25rem" }}>
                                Hospital Confirmed — Casualty Bay Reserved
                              </div>
                              {hr.responseNote && (
                                <div style={{ color: "#14532d", fontStyle: "italic", marginBottom: "0.35rem" }}>
                                  "{hr.responseNote}"
                                </div>
                              )}
                              <p style={{ color: "#166534", fontSize: "0.78rem", margin: 0 }}>
                                Please confirm availability with the hospital/casualty desk before travelling.
                              </p>
                            </div>
                          )}

                          {isRejected && (
                            <div
                              style={{
                                backgroundColor: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.75rem 0.9rem",
                                marginBottom: "1rem",
                                fontSize: "0.85rem"
                              }}
                            >
                              <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "0.25rem" }}>
                                Capacity Full / Cannot Accept
                              </div>
                              <div style={{ color: "#b91c1c" }}>
                                <strong>Reason:</strong> {hr.rejectionReason || "Hospital reported casualty capacity full."}
                              </div>
                              {hr.responseNote && hr.responseNote !== hr.rejectionReason && (
                                <div style={{ color: "#7f1d1d", fontSize: "0.8rem", fontStyle: "italic", marginTop: "0.25rem" }}>
                                  "{hr.responseNote}"
                                </div>
                              )}
                            </div>
                          )}

                          {isUnderReview && (
                            <div
                              style={{
                                backgroundColor: "#f0f9ff",
                                border: "1px solid #bae6fd",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.75rem 0.9rem",
                                marginBottom: "1rem",
                                fontSize: "0.85rem",
                                color: "#0369a1"
                              }}
                            >
                              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                Hospital is reviewing your emergency request.
                              </div>
                              {hr.responseNote && (
                                <div style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                                  "{hr.responseNote}"
                                </div>
                              )}
                            </div>
                          )}

                          {isPending && (
                            <div
                              style={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.75rem 0.9rem",
                                marginBottom: "1rem",
                                fontSize: "0.85rem",
                                color: "var(--text-muted)"
                              }}
                            >
                              Waiting for hospital response. Triage desk notified.
                            </div>
                          )}
                        </div>

                        {/* Footer: Timestamp and Actions */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              paddingTop: "0.6rem",
                              borderTop: "1px solid var(--border-light)",
                              marginBottom: isAccepted ? "0.75rem" : 0
                            }}
                          >
                            <span>
                              Last updated:{" "}
                              {hr.responseTimestamp || hr.updatedAt
                                ? new Date(hr.responseTimestamp || hr.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                  })
                                : "Pending"}
                            </span>
                          </div>

                          {/* Action Buttons for Confirmed Hospitals */}
                          {isAccepted && (
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() =>
                                  openCallModal({
                                    name: hr.hospitalName,
                                    phone: hr.hospitalEmergencyPhone || hr.hospitalPhone
                                  })
                                }
                                className="btn btn-emergency btn-sm"
                                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontSize: "0.82rem" }}
                              >
                                <Phone size={14} />
                                <span>Call Hospital</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDirectionsModal({
                                    name: hr.hospitalName,
                                    address: hr.hospitalAddress || hr.address
                                  })
                                }
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", fontSize: "0.82rem" }}
                              >
                                <Navigation size={14} />
                                <span>Get Directions</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STATUS TIMELINE UI */}
            <div className="card" style={{ padding: "1.75rem 2rem", backgroundColor: "#ffffff" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.25rem" }}>
                  Coordination Lifecycle Timeline
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                  Live progression from patient request dispatch through hospital casualty confirmation.
                </p>
              </div>

              {/* Timeline Container */}
              <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
                {/* Vertical Line */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    bottom: "24px",
                    left: "17px",
                    width: "3px",
                    backgroundColor: "var(--border-light)"
                  }}
                />

                {timelineSteps.map((step, idx) => {
                  const isCurrent = step.state === "current";
                  const isCompleted = step.state === "completed";
                  const isRejected = step.state === "rejected";

                  let nodeBg = "#e2e8f0";
                  let nodeColor = "#64748b";
                  let nodeBorder = "2px solid #cbd5e1";

                  if (isCompleted) {
                    nodeBg = "#16a34a";
                    nodeColor = "#ffffff";
                    nodeBorder = "3px solid #bbf7d0";
                  } else if (isCurrent) {
                    nodeBg = "#0284c7";
                    nodeColor = "#ffffff";
                    nodeBorder = "4px solid #bae6fd";
                  } else if (isRejected) {
                    nodeBg = "#dc2626";
                    nodeColor = "#ffffff";
                    nodeBorder = "3px solid #fecaca";
                  }

                  return (
                    <div
                      key={step.id}
                      style={{
                        position: "relative",
                        marginBottom: idx === timelineSteps.length - 1 ? 0 : "2rem"
                      }}
                    >
                      {/* Node Icon Circle */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-2.5rem",
                          top: "2px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: nodeBg,
                          color: nodeColor,
                          border: nodeBorder,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          boxShadow: isCurrent ? "0 0 0 4px rgba(2, 132, 199, 0.2)" : "none",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {isCompleted ? (
                          <Check size={18} strokeWidth={3} />
                        ) : isRejected ? (
                          <XCircle size={18} />
                        ) : isCurrent ? (
                          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ffffff" }} />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>

                      {/* Step Text Info */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                          <h3
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: isCurrent || isCompleted ? 700 : 600,
                              color: isRejected
                                ? "#dc2626"
                                : isCurrent
                                ? "#0284c7"
                                : isCompleted
                                ? "var(--brand-navy)"
                                : "var(--text-muted)",
                              margin: 0
                            }}
                          >
                            {step.title}
                          </h3>

                          {step.timestamp && (
                            <span
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "var(--brand-teal)",
                                backgroundColor: "var(--bg-subtle)",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "4px"
                              }}
                            >
                              {step.timestamp}
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: isCurrent ? "var(--text-main)" : "var(--text-muted)",
                            margin: "0.25rem 0 0",
                            lineHeight: 1.45
                          }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Medical Platform Safety Disclaimer */}
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fef3c7",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                fontSize: "0.85rem",
                color: "#92400e",
                lineHeight: 1.5
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ display: "block", marginBottom: "0.2rem" }}>
                  Safety & Emergency Information Disclaimer:
                </strong>
                This platform is an emergency coordination and information service, NOT a medical diagnosis or guaranteed reservation system.
                Hospital admission and clinical triage are subject to live hospital assessment upon arrival.
                Always contact the casualty desk directly by phone before commencing transfer. In immediate life-threatening situations, dial <strong>108</strong> (National Ambulance Service) immediately.
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <Link to="/hospitals" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Building2 size={16} />
                <span>Search All Hospitals</span>
              </Link>

              <Link to="/emergency" className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>
                <span>Submit Another Request</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
