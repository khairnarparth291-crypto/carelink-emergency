import React from "react";
import { Menu, Shield, RefreshCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminHeader({ onOpenMobile, onRefresh, isRefreshing }) {
  const { admin } = useAdmin();

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 30
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onOpenMobile}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            color: "#64748b",
            display: "flex",
            alignItems: "center"
          }}
          className="admin-mobile-toggle"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Shield size={12} />
            SUPER ADMIN
          </span>
          <span style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500 }}>
            Operational Command Center
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontSize: "0.82rem",
              fontWeight: 500,
              cursor: isRefreshing ? "not-allowed" : "pointer"
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: isRefreshing ? "spin 0.8s linear infinite" : "none"
              }}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.65rem",
            borderRadius: "6px",
            backgroundColor: "#f1f5f9"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.78rem",
              fontWeight: 700
            }}
          >
            {admin?.name?.charAt(0) || "A"}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>
            {admin?.name || "Administrator"}
          </span>
        </div>
      </div>
    </header>
  );
}
