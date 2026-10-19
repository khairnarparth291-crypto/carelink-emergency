import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";

export default function HospitalLogin() {
  const { login } = useHospitalPortal();
  const navigate = useNavigate();

  const [email, setEmail] = useState("demo@carehospital.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/hospital-portal");
      } else {
        setError(result.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-page)",
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
              width: "56px",
              height: "56px",
              margin: "0 auto 1rem",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 16px rgba(2, 132, 199, 0.25)"
            }}
          >
            <Activity size={32} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "0.4rem" }}>
            Hospital Portal
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            Manage your hospital's emergency capacity and availability.
          </p>

          <div style={{ marginTop: "0.75rem" }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
                backgroundColor: "var(--emergency-light)",
                color: "var(--emergency-red)",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid var(--emergency-border)"
              }}
            >
              Demo Hospital Account
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: "2rem", boxShadow: "var(--shadow-lg)" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "#991b1b",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Hospital ID / Email</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="e.g. demo@carehospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail
                  size={16}
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="Enter hospital password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              id="hospital-login-submit-btn"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Access Helper Box */}
          <div
            style={{
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-light)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                Demo Hospital Desks
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { name: "Care Hospital Pune", email: "demo@carehospital.com" },
                { name: "KEM Memorial Hospital (Pune)", email: "kem@carehospital.com" },
                { name: "Apollo Care Hospital (Pune)", email: "apollo@carehospital.com" },
                { name: "Ruby Metro Hospital (Pune)", email: "ruby@carehospital.com" },
                { name: "Sahyadri Care Hospital (Pune)", email: "sahyadri@carehospital.com" },
                { name: "Lilavati Hospital (Mumbai)", email: "lilavati@carehospital.com" }
              ].map((desk) => (
                <div
                  key={desk.email}
                  onClick={() => {
                    setEmail(desk.email);
                    setPassword("");
                    setError("");
                  }}
                  style={{
                    backgroundColor: email === desk.email ? "#eff6ff" : "var(--bg-subtle)",
                    borderColor: email === desk.email ? "var(--brand-blue)" : "var(--border-light)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: "var(--radius-md)",
                    padding: "0.6rem 0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--brand-navy)" }}>
                      {desk.name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      <code>{desk.email}</code>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: email === desk.email ? "var(--brand-blue)" : "var(--text-muted)"
                    }}
                  >
                    {email === desk.email ? "Selected" : "Fill Email"}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "0.85rem", fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.4 }}>
              Demo hospital credentials must be explicitly configured in the local environment; enter the configured password to sign in.
            </div>
          </div>
        </div>

        {/* Back to Patient Portal link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            to="/"
            style={{
              fontSize: "0.85rem",
              color: "var(--brand-blue)",
              fontWeight: 600,
              textDecoration: "underline"
            }}
          >
            ← Return to CareLink Emergency Patient Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
