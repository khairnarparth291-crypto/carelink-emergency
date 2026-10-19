import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  FileText
} from "lucide-react";
import adminApi from "../../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.getStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || "Failed to load dashboard metrics.");
      }
    } catch (err) {
      setError(err.message || "Network error loading dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #cbd5e1",
            borderTopColor: "#dc2626",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem"
          }}
        />
        Loading operational data from MongoDB...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#991b1b"
        }}
      >
        <p style={{ fontWeight: 600 }}>Error loading statistics:</p>
        <p style={{ fontSize: "0.9rem" }}>{error}</p>
        <button
          onClick={fetchStats}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const hospitals = stats?.hospitals || { total: 0, active: 0, deactivated: 0, ready: 0 };
  const requests = stats?.requests || { total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0 };
  const recentEmergencies = stats?.recentEmergencies || [];
  const recentAuditLogs = stats?.recentAuditLogs || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Title & Intro */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            System Operations & Governance
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.3rem" }}>
            Aggregated real-time metrics across all networked facilities and live emergency dispatches.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            to="/admin/hospitals"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 0.95rem",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            <Building2 size={16} />
            <span>Manage Hospitals</span>
          </Link>
          <Link
            to="/admin/emergencies"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 0.95rem",
              borderRadius: "6px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)"
            }}
          >
            <AlertTriangle size={16} />
            <span>Emergency Monitor</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {/* Total Hospitals */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Network Hospitals
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.5rem" }}>
            {hospitals.total}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", fontSize: "0.78rem" }}>
            <span style={{ color: "#16a34a", fontWeight: 600 }}>
              ● {hospitals.active} Active
            </span>
            {hospitals.deactivated > 0 && (
              <span style={{ color: "#dc2626", fontWeight: 600 }}>
                ● {hospitals.deactivated} Deactivated
              </span>
            )}
          </div>
        </div>

        {/* Total Emergency Requests */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Emergency Requests
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.5rem" }}>
            {requests.total}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", fontSize: "0.78rem" }}>
            <span style={{ color: "#f59e0b", fontWeight: 600 }}>
              ● {requests.pending} Pending
            </span>
            <span style={{ color: "#2563eb", fontWeight: 600 }}>
              ● {requests.accepted} Accepted
            </span>
            <span style={{ color: "#16a34a", fontWeight: 600 }}>
              ● {requests.completed} Completed
            </span>
          </div>
        </div>

        {/* Hospital Readiness */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Immediate Emergency Ready
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.5rem" }}>
            {hospitals.ready}
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
            Hospitals equipped and ready for intake right now
          </div>
        </div>

        {/* Dispatch Acceptance Rate */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Acceptance Ratio
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#faf5ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.5rem" }}>
            {requests.total > 0
              ? `${Math.round(((requests.accepted + requests.completed) / requests.total) * 100)}%`
              : "0%"}
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
            {requests.accepted + requests.completed} accepted of {requests.total} dispatched
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Emergencies & Recent Audit Trail */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem"
        }}
      >
        {/* Recent Emergencies Feed */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} style={{ color: "#dc2626" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Recent Emergency Requests
              </h2>
            </div>
            <Link
              to="/admin/emergencies"
              style={{
                fontSize: "0.82rem",
                color: "#dc2626",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem"
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentEmergencies.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>
              No emergency requests recorded yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentEmergencies.slice(0, 6).map((req) => {
                const isAccepted = req.status === "ACCEPTED";
                const isPending = req.status === "PENDING";
                const isCompleted = req.status === "COMPLETED";

                return (
                  <div
                    key={req._id || req.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #f1f5f9"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1e293b" }}>
                        {req.patientName}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>
                        {req.emergencyType} • {new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "0.25rem 0.6rem",
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
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Administrative Audit Trail */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={18} style={{ color: "#2563eb" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Administrative Audit Activity
              </h2>
            </div>
            <Link
              to="/admin/audit-logs"
              style={{
                fontSize: "0.82rem",
                color: "#2563eb",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem"
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>
              No administrative audit logs recorded yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAuditLogs.slice(0, 6).map((log) => (
                <div
                  key={log._id || log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #f1f5f9"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.84rem", color: "#1e293b" }}>
                      {log.action}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                      {log.adminEmail} • {new Date(log.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#475569"
                    }}
                  >
                    {log.targetEntity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
