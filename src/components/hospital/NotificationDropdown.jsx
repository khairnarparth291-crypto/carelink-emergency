import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";

export default function NotificationDropdown() {
  const { notifications } = useHospitalPortal();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid var(--border-light)",
          backgroundColor: isOpen ? "var(--bg-subtle)" : "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--brand-navy)",
          transition: "all var(--transition-fast)"
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "18px",
              height: "18px",
              backgroundColor: "var(--emergency-red)",
              color: "#ffffff",
              fontSize: "0.68rem",
              fontWeight: 800,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px #ffffff"
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "360px",
            maxWidth: "90vw",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--border-light)",
            zIndex: 1000,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease"
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1rem",
              borderBottom: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand-navy)" }}>
                Emergency Alerts
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: "var(--emergency-light)",
                    color: "var(--emergency-red)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.45rem",
                    borderRadius: "4px"
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--brand-blue)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem"
                }}
              >
                <Check size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {items.map((notif) => (
              <Link
                key={notif.id}
                to={notif.link || "/hospital-portal"}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: notif.unread ? "#f0f9ff" : "transparent",
                  transition: "background-color 0.15s ease",
                  textDecoration: "none"
                }}
              >
                <span style={{ fontSize: "1.25rem", lineHeight: 1, marginTop: "2px" }}>
                  {notif.icon}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span
                      style={{
                        fontWeight: notif.unread ? 700 : 600,
                        fontSize: "0.88rem",
                        color: "var(--brand-navy)"
                      }}
                    >
                      {notif.title}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {notif.time}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.4 }}>
                    {notif.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "0.6rem",
              textAlign: "center",
              borderTop: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-subtle)"
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Demo notifications • Simulation only
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
