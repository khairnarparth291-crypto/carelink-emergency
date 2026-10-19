import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import adminApi from "../../services/adminApi";
import { useAdmin } from "../../context/AdminContext";

export default function AdminAuditLogs() {
  const { showToast } = useAdmin();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        search: search.trim(),
        action: action !== "ALL" ? action : undefined,
        page,
        limit: 15
      });

      if (res.success) {
        setLogs(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      showToast(err.message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }, [search, action, page, showToast]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  const getActionBadge = (act) => {
    if (act === "ADMIN_LOGIN") {
      return {
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "#bfdbfe"
      };
    }
    if (act === "HOSPITAL_DEACTIVATED") {
      return {
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "#fca5a5"
      };
    }
    if (act === "HOSPITAL_ACTIVATED") {
      return {
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#86efac"
      };
    }
    return {
      bg: "#f8fafc",
      color: "#475569",
      border: "#cbd5e1"
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Security & Governance Audit Trail
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Immutable administrative records tracking authentication, facility lifecycle changes, and oversight actions ({total} total logs).
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#475569",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          <span>Refresh Audit Trail</span>
        </button>
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
              placeholder="Search by administrator email, target entity, or ID..."
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

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Action Filter:</label>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
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
            <option value="ALL">All Administrative Actions</option>
            <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
            <option value="HOSPITAL_DEACTIVATED">HOSPITAL_DEACTIVATED</option>
            <option value="HOSPITAL_ACTIVATED">HOSPITAL_ACTIVATED</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Action Executed</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Administrator / IP</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Target Entity</th>
                <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Details & Context</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const detailKeys = log.details ? Object.keys(log.details) : [];

                  return (
                    <tr key={log._id || log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1.25rem", whiteSpace: "nowrap", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Clock size={13} />
                          <span>{new Date(log.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}</span>
                        </div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.22rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.82rem" }}>
                          {log.adminEmail}
                        </div>
                        {log.ipAddress && (
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#475569", fontSize: "0.82rem" }}>
                          {log.targetEntity}
                        </div>
                        {log.targetId && (
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                            #{String(log.targetId).slice(-8).toUpperCase()}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "0.85rem 1.25rem", color: "#334155", fontSize: "0.8rem" }}>
                        {detailKeys.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {detailKeys.map((k) => (
                              <span
                                key={k}
                                style={{
                                  backgroundColor: "#f1f5f9",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "4px",
                                  fontSize: "0.72rem"
                                }}
                              >
                                <strong>{k}:</strong> {String(log.details[k])}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
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
            Showing {logs.length} of {total} records (Page {page} of {pages})
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
    </div>
  );
}
