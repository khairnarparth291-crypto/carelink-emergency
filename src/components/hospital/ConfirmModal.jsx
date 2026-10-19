import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { REJECTION_REASONS } from "../../data/hospitalPortalData";

export default function ConfirmModal({
  isOpen,
  type = "accept", // 'review' | 'accept' | 'reject' | 'complete' | 'confirm'
  title,
  message,
  requestData = null,
  onConfirm,
  onClose
}) {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customNote, setCustomNote] = useState("");

  if (!isOpen) return null;

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === "Other" && customNote.trim()
      ? `Other: ${customNote.trim()}`
      : selectedReason;
    onConfirm(finalReason, customNote.trim() || undefined);
  };

  const isReview = type === "review";
  const isAccept = type === "accept";
  const isReject = type === "reject";
  const isComplete = type === "complete";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: isReject ? "520px" : "490px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: isAccept || isComplete
                  ? "#dcfce7"
                  : isReview
                  ? "#e0f2fe"
                  : "#fee2e2",
                color: isAccept || isComplete
                  ? "var(--status-available)"
                  : isReview
                  ? "var(--brand-blue)"
                  : "var(--status-unavailable)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              {isAccept || isComplete ? (
                <CheckCircle2 size={24} />
              ) : isReview ? (
                <Activity size={22} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)" }}>
                {title ||
                  (isReview
                    ? "Mark Request Under Review"
                    : isAccept
                    ? "Confirm Emergency Acceptance"
                    : isComplete
                    ? "Complete Emergency Coordination"
                    : "Cannot Accept Emergency Case")}
              </h3>
              {requestData && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Case #{requestData.id} • {requestData.emergencyType}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "0.35rem", color: "var(--text-muted)", borderRadius: "var(--radius-sm)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {isReview ? (
          <div>
            <div
              style={{
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem"
              }}
            >
              <p style={{ fontSize: "0.92rem", color: "#0369a1", lineHeight: 1.5, margin: 0 }}>
                {message ||
                  "Marking this case as Under Review notifies the patient that the casualty desk is actively checking bed availability and on-duty specialists."}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Triage Review Note (Optional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Checking ICU Bed 4 and contacting on-call specialist"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(customNote.trim() || undefined)}
                className="btn btn-primary"
                style={{ backgroundColor: "var(--brand-blue)", borderColor: "var(--brand-blue)" }}
              >
                Mark Under Review
              </button>
            </div>
          </div>
        ) : isAccept ? (
          <div>
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem"
              }}
            >
              <p style={{ fontSize: "0.92rem", color: "#166534", lineHeight: 1.5, margin: 0 }}>
                {message ||
                  "You are confirming that the hospital currently reports the required resources for this emergency request."}
              </p>
            </div>

            {requestData && (
              <div
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem"
                }}
              >
                <div>
                  <strong>Patient:</strong> {requestData.gender || "Unspecified"}, {requestData.age} years old
                </div>
                <div>
                  <strong>Required Resources:</strong>{" "}
                  {requestData.requiredFacilities?.join(", ") || "Emergency Care"}
                </div>
                <div>
                  <strong>Estimated Arrival:</strong> {requestData.estimatedArrival} ({requestData.distance || "Simulated ETA"})
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Optional Response Note to Patient / Family:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Casualty Bay 1 ready, on-duty cardiologist waiting"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(customNote.trim() || undefined)}
                className="btn btn-primary"
                style={{ backgroundColor: "var(--status-available)", borderColor: "var(--status-available)" }}
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        ) : isComplete ? (
          <div>
            <div
              style={{
                backgroundColor: "#f0fdfa",
                border: "1px solid #99f6e4",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem"
              }}
            >
              <p style={{ fontSize: "0.92rem", color: "#0f766e", lineHeight: 1.5, margin: 0 }}>
                Mark emergency coordination as Completed. This indicates the patient has arrived or transfer has been successfully concluded.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Completion Note (Optional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Patient admitted to ICU Bed 2"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(customNote.trim() || undefined)}
                className="btn btn-primary"
                style={{ backgroundColor: "var(--brand-teal)", borderColor: "var(--brand-teal)" }}
              >
                Mark Completed
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRejectSubmit}>
            <div
              style={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem 1rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem"
              }}
            >
              <ShieldAlert size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "0.82rem", color: "#9a3412", lineHeight: 1.45, margin: 0 }}>
                Please specify the operational capacity reason. <em>Note: This is an operational resource availability notification, not medical advice.</em>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: "0.6rem" }}>
                Reason for Inability to Accept:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {REJECTION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${selectedReason === reason ? "var(--brand-blue)" : "var(--border-light)"}`,
                      backgroundColor: selectedReason === reason ? "var(--brand-blue-subtle)" : "var(--bg-surface)",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      fontWeight: selectedReason === reason ? 600 : 400
                    }}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: "0.85rem" }}>
                Additional Operational Note / Details (Optional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Trauma bay undergoing sanitization; diverted to partner center"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-emergency"
                style={{ backgroundColor: "var(--emergency-red)" }}
              >
                Submit Inability to Accept
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
