import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X
} from "lucide-react";
import adminApi from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";

export default function AdminEmergencies() {
  const { showToast } = useAdmin();

  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Details Modal State (Read-only)
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const loadEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEmergencies({
        search: search.trim(),
        status: status !== "ALL" ? status : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 10
      });

      if (res.success) {
        setEmergencies(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      showToast(err.message || "Failed to load emergency monitoring feed", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, dateFrom, dateTo, page, showToast]);

  useEffect(() => {
    loadEmergencies();
  }, [loadEmergencies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadEmergencies();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Title & Governance Notice */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Emergency Request Monitoring
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Live centralized audit and surveillance of emergency intakes across the regional grid ({total} total requests).
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            backgroundColor: "#fef3c7",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: "0.78rem",
            fontWeight: 600
          }}
        >
          <ShieldAlert size={16} />
          <span>Read-Only Oversight (Triage decisions remain strictly with hospital clinical staff)</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 280px", maxWidth: "420px" }}
        >
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8"
              }}
            />
            <input
              type="text"
              placeholder="Search by patient, emergency type, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#1e293b",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Status:</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                outline: "none"
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Date range filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={14} style={{ color: "#64748b" }} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                color: "#1e293b"
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                color: "#1e293b"
              }}
            />
          </div>

          {(search || status !== "ALL" || dateFrom || dateTo) && (
            <button
              onClick={handleClearFilters}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Emergencies Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Emergency Case / ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Patient</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Type & Requirements</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    Loading live emergency stream...
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    No emergency requests match your current filters.
                  </td>
                </tr>
              ) : (
                emergencies.map((em) => {
                  const idStr = String(em._id || em.id);
                  const isAccepted = em.status === "ACCEPTED";
                  const isPending = em.status === "PENDING";
                  const isCompleted = em.status === "COMPLETED";

                  return (
                    <tr key={idStr} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                          #{idStr.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.76rem", marginTop: "2px" }}>
                          Phone: {em.contactPhone || "Not provided"}
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.88rem" }}>
                          {em.patientName}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.76rem" }}>
                          {em.patientAge} yrs • {em.patientGender || "Unspecified"}
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#dc2626", fontSize: "0.84rem" }}>
                          {em.emergencyType}
                        </div>
                        <div style={{ color: "#475569", fontSize: "0.76rem" }}>
                          Bed: {em.requiredBedType || "Normal"}
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.22rem 0.6rem",
                            borderRadius: "9999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backgroundColor: isAccepted
                              ? "#dcfce7"
                              : isPending
                              ? "#fef3c7"
                              : isCompleted
                              ? "#dbeafe"
                              : "#fee2e2",
                            color: isAccepted
                              ? "#166534"
                              : isPending
                              ? "#92400e"
                              : isCompleted
                              ? "#1e40af"
                              : "#991b1b"
                          }}
                        >
                          {em.status}
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem", color: "#64748b", fontSize: "0.78rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={13} />
                          <span>{new Date(em.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedEmergency(em)}
                          title="View Emergency Details (Read-Only)"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "5px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.82rem",
            color: "#64748b"
          }}
        >
          <div>
            Showing {emergencies.length} of {total} requests (Page {page} of {pages})
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.35rem 0.6rem",
                borderRadius: "5px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                color: page <= 1 ? "#94a3b8" : "#334155"
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.35rem 0.6rem",
                borderRadius: "5px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                cursor: page >= pages ? "not-allowed" : "pointer",
                color: page >= pages ? "#94a3b8" : "#334155"
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Read-Only Details Modal */}
      {selectedEmergency && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.75rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px"
                    }}
                  >
                    READ-ONLY AUDIT VIEW
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                    Request ID: #{String(selectedEmergency._id || selectedEmergency.id).slice(-8).toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0.3rem 0 0" }}>
                  {selectedEmergency.patientName} ({selectedEmergency.patientAge}y, {selectedEmergency.patientGender})
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmergency(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Read-Only Banner */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "0.6rem 0.85rem",
                fontSize: "0.78rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <ShieldAlert size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <span>
                Administrative oversight mode. Modification of triage decisions is restricted to hospital operators.
              </span>
            </div>

            {/* Emergency Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                backgroundColor: "#f8fafc",
                padding: "1rem",
                borderRadius: "8px"
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Emergency Type
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#dc2626", marginTop: "2px" }}>
                  {selectedEmergency.emergencyType}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Current Status
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                  {selectedEmergency.status}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Contact Phone
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", marginTop: "2px" }}>
                  {selectedEmergency.contactPhone || "N/A"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Required Bed Type
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", marginTop: "2px" }}>
                  {selectedEmergency.requiredBedType || "Normal"}
                </div>
              </div>
            </div>

            {/* Reported Symptoms / Notes */}
            {(selectedEmergency.reportedComplaint || selectedEmergency.message) && (
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Reported Complaint & Notes
                </div>
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "0.75rem",
                    fontSize: "0.85rem",
                    color: "#475569"
                  }}
                >
                  {selectedEmergency.reportedComplaint || selectedEmergency.message}
                </div>
              </div>
            )}

            {/* Location Info */}
            {selectedEmergency.location && (
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                  Patient GPS & Location Sharing
                </div>
                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "6px",
                    padding: "0.75rem",
                    fontSize: "0.82rem",
                    color: "#1e40af"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MapPin size={16} />
                    <span>
                      {typeof selectedEmergency.location === "object" && selectedEmergency.location.latitude != null
                        ? `Coordinates: ${selectedEmergency.location.latitude.toFixed(5)}, ${selectedEmergency.location.longitude.toFixed(5)}`
                        : (typeof selectedEmergency.location === "object" ? selectedEmergency.location.address || "Location specified" : selectedEmergency.location)}
                    </span>
                  </div>
                  {typeof selectedEmergency.location === "object" && selectedEmergency.location.address && selectedEmergency.location.latitude != null && (
                    <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#1e40af" }}>
                      Address: {selectedEmergency.location.address}
                    </div>
                  )}
                  {typeof selectedEmergency.location === "object" && selectedEmergency.location.accuracy && (
                    <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#3b82f6" }}>
                      Accuracy: ±{Math.round(selectedEmergency.location.accuracy)} meters
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hospital Responses Breakdown */}
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                Hospital Dispatches & Responses
              </div>
              {selectedEmergency.hospitalResponses && selectedEmergency.hospitalResponses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedEmergency.hospitalResponses.map((hr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "6px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                          {hr.hospitalName || "Hospital Facility"}
                        </div>
                        {hr.responseNote && (
                          <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>
                            Note: "{hr.responseNote}"
                          </div>
                        )}
                        {hr.rejectionReason && (
                          <div style={{ fontSize: "0.76rem", color: "#dc2626", marginTop: "2px" }}>
                            Declined: {hr.rejectionReason}
                          </div>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor:
                            hr.responseStatus === "ACCEPTED"
                              ? "#dcfce7"
                              : hr.responseStatus === "REJECTED"
                              ? "#fee2e2"
                              : "#f1f5f9",
                          color:
                            hr.responseStatus === "ACCEPTED"
                              ? "#15803d"
                              : hr.responseStatus === "REJECTED"
                              ? "#b91c1c"
                              : "#475569"
                        }}
                      >
                        {hr.responseStatus || "PENDING"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : selectedEmergency.hospitalResponse ? (
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "6px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                      {selectedEmergency.hospitalResponse.hospitalName || "Hospital Facility"}
                    </div>
                    {selectedEmergency.hospitalResponse.note && (
                      <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                        Note: "{selectedEmergency.hospitalResponse.note}"
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: "#dcfce7",
                      color: "#15803d"
                    }}
                  >
                    {selectedEmergency.hospitalResponse.status || "ACCEPTED"}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
                  Awaiting responses from regional emergency hospital triage desks.
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setSelectedEmergency(null)}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
