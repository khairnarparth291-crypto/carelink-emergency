import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminLogin() {
  const { login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@carelink.org");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both administrator email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Authentication failed. Verify credentials.");
      }
    } catch (err) {
      setError(err.message || "Failed to reach administrator authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@carelink.org");
    setPassword("");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0f19",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem"
      }}
    >
      <div style={{ maxWidth: "440px", width: "100%" }}>
        {/* Brand Logo & Heading */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              marginBottom: "1rem",
              boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.5)"
            }}
          >
            <Shield size={32} />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "0.4rem",
              letterSpacing: "-0.02em"
            }}
          >
            Admin Command Center
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            CareLink Emergency Management & Governance Portal
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "12px",
            border: "1px solid #1f2937",
            padding: "2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}
        >
          {error && (
            <div
              style={{
                backgroundColor: "#450a0a",
                border: "1px solid #991b1b",
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                color: "#fca5a5",
                fontSize: "0.88rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem"
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: "0.5rem"
                }}
              >
                Administrator Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280"
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@carelink.org"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 0.9rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #374151",
                    backgroundColor: "#1f2937",
                    color: "#f9fafb",
                    fontSize: "0.92rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  marginBottom: "0.5rem"
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280"
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 0.9rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #374151",
                    backgroundColor: "#1f2937",
                    color: "#f9fafb",
                    fontSize: "0.92rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.85rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                transition: "background 0.2s"
              }}
            >
              {isSubmitting ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Provisioned Admin Credentials Reminder / Convenience */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #1f2937",
              textAlign: "center"
            }}
          >
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                background: "none",
                border: "1px dashed #4b5563",
                borderRadius: "6px",
                padding: "0.45rem 0.85rem",
                color: "#9ca3af",
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <Sparkles size={14} style={{ color: "#f59e0b" }} />
              <span>Fill Demo Email</span>
            </button>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.74rem",
                marginTop: "0.5rem",
                marginBottom: 0
              }}
            >
              Password must be entered manually.
            </p>
          </div>
        </div>

        {/* Back navigation */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.82rem"
          }}
        >
          <Link
            to="/"
            style={{
              color: "#94a3b8",
              textDecoration: "none"
            }}
          >
            ← Back to Patient Portal
          </Link>
          <Link
            to="/hospital-portal/login"
            style={{
              color: "#94a3b8",
              textDecoration: "none"
            }}
          >
            Hospital Portal Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
