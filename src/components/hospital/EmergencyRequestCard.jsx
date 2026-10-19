import React, { useState } from "react";
import {
  Siren,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  CreditCard,
  Check,
  Navigation,
  Activity,
  ExternalLink
} from "lucide-react";
import PatientLocationMap from "../PatientLocationMap";
import { getLocationInfo, getDirectionsUrl, formatCoordinates } from "../../utils/locationHelper";

export default function EmergencyRequestCard({
  request,
  onReview,
  onAccept,
  onReject,
  onComplete
}) {
  const isAccepted = request.status === "Accepted" || request.rawStatus === "ACCEPTED";
  const isRejected = request.status === "Cannot Accept" || request.rawStatus === "REJECTED";
  const isUnderReview = request.status === "Under Review" || request.rawStatus === "UNDER_REVIEW";
  const isCompleted = request.status === "Completed" || request.rawStatus === "COMPLETED";
  const isPending =
    !isAccepted && !isRejected && !isUnderReview && !isCompleted;

  const locInfo = request.locationInfo || getLocationInfo(request.location);
  const directionsUrl = getDirectionsUrl(request.location);
  const [showMap, setShowMap] = useState(locInfo.hasCoordinates);

  let borderColor = "var(--border-light)";
  if (isAccepted) borderColor = "var(--status-available)";
  else if (isRejected) borderColor = "var(--status-unavailable)";
  else if (isUnderReview) borderColor = "var(--brand-blue)";
  else if (isCompleted) borderColor = "var(--brand-teal)";
  else if (isPending) borderColor = "var(--status-limited)";

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        borderLeft: `5px solid ${borderColor}`,
        boxShadow: isPending || isUnderReview ? "0 4px 16px rgba(2, 132, 199, 0.08)" : "var(--shadow-sm)",
        position: "relative"
      }}
    >
      {/* Header with Case ID and Status */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.75rem",
          marginBottom: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: isPending ? "var(--emergency-light)" : isUnderReview ? "#e0f2fe" : "#f1f5f9",
              color: isPending ? "var(--emergency-red)" : isUnderReview ? "var(--brand-blue)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isUnderReview ? <Activity size={18} /> : <Siren size={18} />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--brand-navy)" }}>
                Emergency Request #{request.id}
              </h3>
              {isPending && (
                <span className="badge-new-pulse">
                  NEW INCOMING
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
              <Clock size={12} />
              <span>Received {request.receivedTime || "Recently"}</span>
            </div>
          </div>
        </div>

        {/* Current Case Status Badge */}
        <div>
          {isAccepted && (
            <div style={{ textAlign: "right" }}>
              <span
                className="badge-status badge-available"
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", gap: "0.4rem" }}
              >
                <CheckCircle2 size={15} />
                <span>Hospital Confirmed</span>
              </span>
              <div style={{ fontSize: "0.72rem", color: "var(--status-available)", fontWeight: 600, marginTop: "2px" }}>
                Confirmed {request.confirmedAt || "recently"}
              </div>
              {request.responseNote && (
                <div style={{ fontSize: "0.75rem", color: "#166534", fontStyle: "italic", marginTop: "2px" }}>
                  "{request.responseNote}"
                </div>
              )}
            </div>
          )}

          {isRejected && (
            <div style={{ textAlign: "right" }}>
              <span
                className="badge-status badge-unavailable"
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem", gap: "0.4rem" }}
              >
                <XCircle size={15} />
                <span>Cannot Accept</span>
              </span>
              {request.statusNote && (
                <div style={{ fontSize: "0.75rem", color: "var(--status-unavailable)", fontWeight: 500, marginTop: "2px" }}>
                  {request.statusNote}
                </div>
              )}
            </div>
          )}

          {isUnderReview && (
            <div style={{ textAlign: "right" }}>
              <span
                className="badge-status badge-limited"
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.82rem",
                  gap: "0.4rem",
                  backgroundColor: "#f0f9ff",
                  color: "#0284c7",
                  border: "1px solid #bae6fd"
                }}
              >
                <Activity size={14} className="spin" />
                <span>Under Review</span>
              </span>
              {request.responseNote && (
                <div style={{ fontSize: "0.75rem", color: "#0369a1", fontStyle: "italic", marginTop: "2px" }}>
                  "{request.responseNote}"
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div style={{ textAlign: "right" }}>
              <span
                className="badge-status badge-available"
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.82rem", gap: "0.4rem" }}
              >
                <Check size={14} strokeWidth={3} />
                <span>Completed</span>
              </span>
            </div>
          )}

          {isPending && (
            <span
              className="badge-status badge-limited"
              style={{ padding: "0.3rem 0.75rem", fontSize: "0.82rem" }}
            >
              <AlertCircle size={14} />
              <span>Awaiting Hospital Response</span>
            </span>
          )}
        </div>
      </div>

      {/* Emergency Condition Banner */}
      <div
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Emergency:</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--brand-navy)" }}>
            {request.emergencyType}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>•</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
            Patient: <strong>{request.patientName || "Anonymous"}</strong> ({request.patientGender || "Unspecified"}, {request.patientAge || request.age || "Unknown"} yrs)
          </span>
        </div>
        {(request.reportedComplaint || request.symptoms || request.requiredSpecialist) && (
          <div style={{ fontSize: "0.82rem", color: "#475569", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem" }}>
            {request.reportedComplaint && (
              <span>
                <span style={{ fontWeight: 600, color: "var(--brand-navy)" }}>Reported Problem:</span>{" "}
                <em>"{request.reportedComplaint || request.symptoms}"</em>
              </span>
            )}
            {request.suggestedSpecialist && (
              <span style={{ color: "var(--brand-blue)", fontWeight: 600 }}>
                (Nav suggested: {request.suggestedSpecialist})
              </span>
            )}
            {request.requiredSpecialist && (
              <span style={{ color: "#065f46", fontWeight: 700, backgroundColor: "#d1fae5", padding: "0.1rem 0.45rem", borderRadius: "4px", fontSize: "0.78rem" }}>
                Requested Specialist: {request.requiredSpecialist}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Required Capabilities Pills */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brand-navy)", marginBottom: "0.45rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Required Resources Reported by Patient:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {request.requiredFacilities?.map((req) => (
            <span
              key={req}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: "1px solid #bae6fd"
              }}
            >
              <Check size={13} strokeWidth={3} />
              <span>{req}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Details Grid: Travel, Budget, Insurance */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.85rem",
          padding: "0.85rem 0",
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
          marginBottom: "1.25rem",
          fontSize: "0.82rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Navigation size={16} color="var(--brand-blue)" />
          <div>
            <div style={{ color: "var(--text-muted)" }}>Estimated Arrival</div>
            <div style={{ fontWeight: 700, color: "var(--brand-navy)", fontSize: "0.9rem" }}>
              {request.estimatedArrival || "15 min"} {request.distance ? `(${request.distance})` : ""}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapPin size={16} color={locInfo.hasCoordinates ? "#dc2626" : "#0d9488"} />
          <div>
            <div style={{ color: "var(--text-muted)" }}>Origin Location</div>
            <div style={{ fontWeight: 600, color: "var(--brand-navy)" }}>
              {locInfo.hasLocation ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                  <span>{locInfo.displayText}</span>
                  {locInfo.hasCoordinates && (
                    <span style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#047857",
                      backgroundColor: "#d1fae5",
                      padding: "0.08rem 0.35rem",
                      borderRadius: "4px"
                    }}>
                      GPS
                    </span>
                  )}
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Location not provided.
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CreditCard size={16} color="#d97706" />
          <div>
            <div style={{ color: "var(--text-muted)" }}>Budget Tier</div>
            <div style={{ fontWeight: 600, color: "var(--brand-navy)" }}>{request.budget || "Standard"}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Shield size={16} color="#7c3aed" />
          <div>
            <div style={{ color: "var(--text-muted)" }}>Insurance Type</div>
            <div style={{ fontWeight: 600, color: "var(--brand-navy)" }}>{request.insurance || "Private / Cashless"}</div>
          </div>
        </div>
      </div>

      {/* Patient Location, Map & Directions Section */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "var(--radius-md, 8px)",
          border: "1px solid var(--border-light, #e2e8f0)",
          padding: "0.9rem 1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: locInfo.hasCoordinates && showMap ? "0.75rem" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <MapPin size={16} color={locInfo.hasCoordinates ? "#dc2626" : locInfo.hasLocation ? "#0284c7" : "#94a3b8"} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-navy, #0f172a)" }}>
              Patient Location & Routing
            </span>
            {locInfo.hasCoordinates && (
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#065f46",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                padding: "0.1rem 0.45rem",
                borderRadius: "4px"
              }}>
                GPS Verified
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {locInfo.hasCoordinates && (
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "0.76rem", padding: "0.22rem 0.55rem" }}
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            )}

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.78rem",
                  color: "var(--brand-blue, #0284c7)",
                  borderColor: "var(--brand-blue, #0284c7)",
                  textDecoration: "none",
                  fontWeight: 600,
                  backgroundColor: "#ffffff"
                }}
                id={`get-directions-${request.id || request._id}`}
              >
                <Navigation size={13} />
                <span>Get Directions</span>
                <ExternalLink size={12} style={{ opacity: 0.7 }} />
              </a>
            )}
          </div>
        </div>

        {/* Location Details / Map Render */}
        {locInfo.hasCoordinates ? (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: showMap ? "0.6rem" : "0" }}>
              <span>Coordinates: <strong style={{ color: "var(--brand-navy)" }}>{formatCoordinates(locInfo.latitude, locInfo.longitude)}</strong></span>
              {locInfo.address && <span> • <em>"{locInfo.address}"</em></span>}
            </div>

            {showMap && (
              <PatientLocationMap
                latitude={locInfo.latitude}
                longitude={locInfo.longitude}
                address={locInfo.address}
                source={locInfo.source}
                height="220px"
                showDirectionsButton={false}
              />
            )}
          </div>
        ) : locInfo.hasLocation ? (
          <div style={{ fontSize: "0.82rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span>Address: <strong>{locInfo.displayText}</strong></span>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>(GPS coordinates unavailable for map display)</span>
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
            Location not provided.
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {isAccepted
            ? "✓ Confirmed in emergency coordination network. Trauma bay notified."
            : isRejected
            ? "✕ Marked unable to accept due to facility/specialist capacity."
            : isUnderReview
            ? "⏳ Staff reviewing bed & specialist readiness before decision."
            : isCompleted
            ? "✓ Case coordination concluded."
            : "Review reported resource availability before accepting case."}
        </div>

        {isPending ? (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {onReview && (
              <button
                onClick={() => onReview(request)}
                className="btn btn-outline btn-sm"
                style={{
                  color: "var(--brand-blue)",
                  borderColor: "var(--brand-blue)",
                  fontWeight: 600,
                  fontSize: "0.8rem"
                }}
              >
                <Activity size={14} />
                <span>Mark Reviewing</span>
              </button>
            )}

            <button
              onClick={() => onReject(request)}
              className="btn btn-outline btn-sm"
              style={{
                color: "var(--emergency-red)",
                borderColor: "var(--emergency-border)",
                fontWeight: 600,
                fontSize: "0.8rem"
              }}
            >
              <XCircle size={14} />
              <span>Cannot Accept</span>
            </button>

            <button
              onClick={() => onAccept(request)}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: "var(--status-available)",
                borderColor: "var(--status-available)",
                fontWeight: 700,
                fontSize: "0.8rem"
              }}
            >
              <CheckCircle2 size={14} />
              <span>Accept Case</span>
            </button>
          </div>
        ) : isUnderReview ? (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => onReject(request)}
              className="btn btn-outline btn-sm"
              style={{
                color: "var(--emergency-red)",
                borderColor: "var(--emergency-border)",
                fontWeight: 600,
                fontSize: "0.8rem"
              }}
            >
              <XCircle size={14} />
              <span>Cannot Accept</span>
            </button>

            <button
              onClick={() => onAccept(request)}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: "var(--status-available)",
                borderColor: "var(--status-available)",
                fontWeight: 700,
                fontSize: "0.8rem"
              }}
            >
              <CheckCircle2 size={14} />
              <span>Accept Case</span>
            </button>
          </div>
        ) : isAccepted ? (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {onComplete && (
              <button
                onClick={() => onComplete(request)}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--brand-teal)",
                  borderColor: "var(--brand-teal)",
                  fontSize: "0.78rem"
                }}
              >
                <Check size={14} strokeWidth={3} />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              onClick={() => onReject(request)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.78rem", color: "var(--emergency-red)", borderColor: "var(--emergency-border)" }}
            >
              <span>Change to Cannot Accept</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onAccept(request)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              <span>Re-open / Accept</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
