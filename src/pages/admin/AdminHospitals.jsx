import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  X,
  Eye,
  Bed,
  Stethoscope,
  Mail
} from "lucide-react";
import adminApi from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";

export default function AdminHospitals() {
  const { showToast } = useAdmin();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [readinessStatus, setReadinessStatus] = useState("ALL");

  // Deactivation Modal State
  const [modalTarget, setModalTarget] = useState(null); // Hospital object
  const [deactivateReason, setDeactivateReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Detailed Hospital View Modal State
  const [detailModalTarget, setDetailModalTarget] = useState(null);
  const [hospitalDetail, setHospitalDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadHospitals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHospitals({
        search: search.trim(),
        status: status !== "all" ? status : undefined,
        readinessStatus: readinessStatus !== "ALL" ? readinessStatus : undefined,
        page,
        limit: 10
      });

      if (res.success) {
        setHospitals(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      showToast(err.message || "Failed to load hospitals list", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, readinessStatus, page, showToast]);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHospitals();
  };

  const handleOpenDetails = async (hospital) => {
    setDetailModalTarget(hospital);
    setDetailLoading(true);
    setDetailError("");
    setHospitalDetail(null);
    try {
      const res = await adminApi.getHospitalById(hospital._id || hospital.id);
      if (res.success) {
        setHospitalDetail(res.data);
      } else {
        setDetailError(res.message || "Could not retrieve hospital details.");
      }
    } catch (err) {
      setDetailError(err.message || "Failed to load hospital details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDeactivate = (hospital) => {
    setModalTarget(hospital);
    setDeactivateReason("");
    setModalError("");
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateReason.trim()) {
      setModalError("Please provide an administrative reason for deactivating this facility.");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const res = await adminApi.updateHospitalStatus(
        modalTarget._id || modalTarget.id,
        false,
        deactivateReason.trim()
      );
      if (res.success) {
        showToast(`Hospital '${modalTarget.name}' has been deactivated. Sessions revoked.`, "info");
        setModalTarget(null);
        loadHospitals();
      }
    } catch (err) {
      setModalError(err.message || "Failed to deactivate hospital.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickActivate = async (hospital) => {
    try {
      const res = await adminApi.updateHospitalStatus(hospital._id || hospital.id, true);
      if (res.success) {
        showToast(`Hospital '${hospital.name}' reactivated successfully.`, "success");
        loadHospitals();
      }
    } catch (err) {
      showToast(err.message || "Failed to reactivate hospital.", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Hospital Directory & Governance
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Audit compliance, verify readiness status, and manage active system privileges ({total} total registered).
          </p>
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
              placeholder="Search by hospital name, city, phone..."
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
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>
          </div>

          {/* Readiness Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Readiness:</label>
            <select
              value={readinessStatus}
              onChange={(e) => {
                setReadinessStatus(e.target.value);
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
              <option value="ALL">All Readiness</option>
              <option value="READY">READY</option>
              <option value="LIMITED">LIMITED</option>
              <option value="NOT_READY">NOT_READY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hospitals Table */}
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
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Hospital Facility</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>City / Location</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Readiness</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Account Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Emergency Contact</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    Loading hospitals directory...
                  </td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    No hospitals match your search criteria.
                  </td>
                </tr>
              ) : (
                hospitals.map((h) => {
                  const isActive = h.isActive !== false;
                  const isReady = h.readinessStatus === "READY";
                  const isLimited = h.readinessStatus === "LIMITED";

                  return (
                    <tr
                      key={h._id || h.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: !isActive ? "#fffbfb" : "transparent"
                      }}
                    >
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.88rem" }}>
                          {h.name}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "2px" }}>
                          {h.address}
                        </div>
                        {!isActive && h.statusReason && (
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "0.72rem",
                              color: "#b91c1c",
                              fontWeight: 500,
                              backgroundColor: "#fee2e2",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block"
                            }}
                          >
                            Reason: {h.statusReason}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "0.9rem 1rem", color: "#334155" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <MapPin size={14} style={{ color: "#94a3b8" }} />
                          <span>{h.city}</span>
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.55rem",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backgroundColor: isReady
                              ? "#dcfce7"
                              : isLimited
                              ? "#fef3c7"
                              : "#fee2e2",
                            color: isReady
                              ? "#15803d"
                              : isLimited
                              ? "#b45309"
                              : "#b91c1c"
                          }}
                        >
                          {h.readinessStatus}
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "9999px",
                            fontSize: "0.74rem",
                            fontWeight: 600,
                            backgroundColor: isActive ? "#ecfdf5" : "#fef2f2",
                            color: isActive ? "#047857" : "#b91c1c",
                            border: `1px solid ${isActive ? "#a7f3d0" : "#fca5a5"}`
                          }}
                        >
                          {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>{isActive ? "ACTIVE" : "DEACTIVATED"}</span>
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem", color: "#475569", fontSize: "0.8rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={13} style={{ color: "#94a3b8" }} />
                          <span>{h.emergencyPhone || h.phone}</span>
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.45rem", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(h)}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "5px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              transition: "all 0.15s ease"
                            }}
                            title="Inspect bed capacity, specialist roster, and details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                          {isActive ? (
                            <button
                              onClick={() => handleOpenDeactivate(h)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "5px",
                                border: "1px solid #f87171",
                                backgroundColor: "#ffffff",
                                color: "#dc2626",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickActivate(h)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "5px",
                                border: "1px solid #34d399",
                                backgroundColor: "#ffffff",
                                color: "#059669",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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
            Showing {hospitals.length} of {total} facilities (Page {page} of {pages})
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

      {/* Deactivation Confirmation Modal */}
      {modalTarget && (
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
              maxWidth: "500px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Deactivate Hospital Account
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>
                    {modalTarget.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalTarget(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fef08a",
                borderRadius: "6px",
                padding: "0.75rem 1rem",
                fontSize: "0.82rem",
                color: "#92400e",
                lineHeight: 1.45
              }}
            >
              <strong>Security Policy Note:</strong> Deactivating this hospital will immediately revoke
              active login access. Any previously issued JWT tokens for this facility will be rejected
              on protected endpoints. Historical emergency records will remain preserved and reversible.
            </div>

            {modalError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.82rem",
                  color: "#991b1b"
                }}
              >
                {modalError}
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "0.4rem"
                }}
              >
                Deactivation Reason (Required for Audit Trail)
              </label>
              <textarea
                rows={3}
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="e.g. Temporary licensing review, emergency ward reconstruction, compliance verification"
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeactivate}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Deactivating..." : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hospital Full Details Modal */}
      {detailModalTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(3px)",
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
              borderRadius: "14px",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.75rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "4px",
                      backgroundColor:
                        detailModalTarget.readinessStatus === "READY"
                          ? "#dcfce7"
                          : detailModalTarget.readinessStatus === "LIMITED"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        detailModalTarget.readinessStatus === "READY"
                          ? "#15803d"
                          : detailModalTarget.readinessStatus === "LIMITED"
                          ? "#b45309"
                          : "#b91c1c"
                    }}
                  >
                    READINESS: {detailModalTarget.readinessStatus || "UNKNOWN"}
                  </span>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "4px",
                      backgroundColor: detailModalTarget.isActive !== false ? "#ecfdf5" : "#fef2f2",
                      color: detailModalTarget.isActive !== false ? "#047857" : "#b91c1c",
                      border: `1px solid ${detailModalTarget.isActive !== false ? "#a7f3d0" : "#fca5a5"}`
                    }}
                  >
                    {detailModalTarget.isActive !== false ? "ACCOUNT ACTIVE" : "ACCOUNT DEACTIVATED"}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {detailModalTarget.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#64748b", fontSize: "0.82rem", marginTop: "4px" }}>
                  <MapPin size={14} />
                  <span>{detailModalTarget.address}, {detailModalTarget.city}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalTarget(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={22} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid #cbd5e1",
                    borderTopColor: "#0284c7",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 0.75rem"
                  }}
                />
                Loading facility availability and specialist records...
              </div>
            ) : detailError ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#991b1b",
                  fontSize: "0.85rem"
                }}
              >
                {detailError}
              </div>
            ) : (
              <>
                {/* Deactivation Banner if deactivated */}
                {detailModalTarget.isActive === false && (
                  <div
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      padding: "0.85rem 1rem",
                      fontSize: "0.82rem",
                      color: "#991b1b"
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <AlertTriangle size={15} />
                      <span>Facility Deactivated</span>
                    </div>
                    <div><strong>Reason:</strong> {hospitalDetail?.statusReason || detailModalTarget.statusReason || "Not specified"}</div>
                    {hospitalDetail?.deactivatedAt && (
                      <div style={{ fontSize: "0.76rem", color: "#b91c1c", marginTop: "2px" }}>
                        Deactivated on {new Date(hospitalDetail.deactivatedAt).toLocaleString()}
                        {hospitalDetail.deactivatedBy && (
                          <span> by {hospitalDetail.deactivatedBy.name || hospitalDetail.deactivatedBy.email}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Facility Contact & Location Card */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.75rem",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.9rem"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Emergency Contact</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                      <Phone size={13} />
                      <span>{detailModalTarget.emergencyPhone || "None listed"}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>General Contact</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                      <Phone size={13} />
                      <span>{detailModalTarget.phone || "None listed"}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Official Email</div>
                    <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                      <Mail size={13} style={{ color: "#94a3b8" }} />
                      <span>{detailModalTarget.email || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>GPS Coordinates</div>
                    <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                      <MapPin size={13} style={{ color: "#94a3b8" }} />
                      <span>
                        {detailModalTarget.latitude && detailModalTarget.longitude
                          ? `${Number(detailModalTarget.latitude).toFixed(4)}, ${Number(detailModalTarget.longitude).toFixed(4)}`
                          : "No GPS coordinates"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bed Availability Section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      <Bed size={16} style={{ color: "#0284c7" }} />
                      <span>Bed Availability & Capacity</span>
                    </div>
                    {hospitalDetail?.availability?.lastUpdated && (
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        Updated: {new Date(hospitalDetail.availability.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {hospitalDetail?.availability?.beds ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "0.65rem"
                      }}
                    >
                      {[
                        { label: "Normal Beds", key: "normal", color: "#0284c7" },
                        { label: "ICU Beds", key: "icu", color: "#dc2626" },
                        { label: "Ventilators", key: "ventilator", color: "#7c3aed" },
                        { label: "Emergency Beds", key: "emergency", color: "#ea580c" }
                      ].map(({ label, key, color }) => {
                        const bedData = hospitalDetail.availability.beds[key] || { total: 0, occupied: 0, available: 0 };
                        const available = Number(bedData.available ?? (Number(bedData.total || 0) - Number(bedData.occupied || 0)));
                        const total = Number(bedData.total || 0);
                        const occupied = Number(bedData.occupied || 0);

                        return (
                          <div
                            key={key}
                            style={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "0.75rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.3rem"
                            }}
                          >
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569" }}>{label}</span>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                              <span style={{ fontSize: "1.25rem", fontWeight: 800, color }}>{available}</span>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>/ {total} avail</span>
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                              {occupied} occupied
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "0.82rem",
                        color: "#64748b"
                      }}
                    >
                      No live bed census recorded yet for this facility.
                    </div>
                  )}
                </div>

                {/* Specialists & Doctors Roster */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      <Stethoscope size={16} style={{ color: "#16a34a" }} />
                      <span>Specialists & Medical Staff ({hospitalDetail?.doctors?.length || hospitalDetail?.doctorCount || 0})</span>
                    </div>
                  </div>

                  {hospitalDetail?.doctors && hospitalDetail.doctors.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "0.65rem",
                        maxHeight: "220px",
                        overflowY: "auto",
                        paddingRight: "0.25rem"
                      }}
                    >
                      {hospitalDetail.doctors.map((doc) => {
                        const isAvail = doc.status === "AVAILABLE" || doc.isAvailable;
                        return (
                          <div
                            key={doc._id || doc.id || doc.name}
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "0.65rem 0.8rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.2rem"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                                {doc.name}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                  backgroundColor: isAvail ? "#dcfce7" : "#fee2e2",
                                  color: isAvail ? "#166534" : "#991b1b"
                                }}
                              >
                                {doc.status || (isAvail ? "AVAILABLE" : "BUSY")}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.76rem", color: "#0284c7", fontWeight: 600 }}>
                              {doc.specialization || doc.specialty || "General Medicine"}
                            </span>
                            {doc.qualification && (
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                {doc.qualification}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "0.82rem",
                        color: "#64748b"
                      }}
                    >
                      No specialized medical officers currently listed for this facility.
                    </div>
                  )}
                </div>

                {/* Modal Actions Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "1rem",
                    marginTop: "0.5rem"
                  }}
                >
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Facility ID: <code style={{ backgroundColor: "#f1f5f9", padding: "2px 5px", borderRadius: "4px" }}>{detailModalTarget._id || detailModalTarget.id}</code>
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <button
                      type="button"
                      onClick={() => setDetailModalTarget(null)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Close Details
                    </button>

                    {detailModalTarget.isActive !== false ? (
                      <button
                        type="button"
                        onClick={() => {
                          const target = detailModalTarget;
                          setDetailModalTarget(null);
                          handleOpenDeactivate(target);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Deactivate Facility
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const target = detailModalTarget;
                          setDetailModalTarget(null);
                          handleQuickActivate(target);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#059669",
                          color: "#ffffff",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Reactivate Facility
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
