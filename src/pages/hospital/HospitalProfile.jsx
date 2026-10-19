import React, { useState } from "react";
import { Hospital, Save, CheckCircle2 } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";

export default function HospitalProfile() {
  const { hospital, updateProfile, isBackendConnected } = useHospitalPortal();

  const [form, setForm] = useState({
    name: hospital.name || "",
    type: hospital.type || "Multi-specialty",
    status: hospital.status || "ACTIVE",
    address: hospital.address || "",
    city: hospital.city || "Pune",
    state: hospital.state || "Maharashtra",
    pinCode: hospital.pinCode || "",
    phone: hospital.phone || "",
    emergencyPhone: hospital.emergencyPhone || "",
    email: hospital.email || "",
    website: hospital.website || "",
    totalBeds: hospital.totalBeds || 120,
    establishedYear: hospital.establishedYear || "2008",
    description: hospital.description || ""
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const hospitalTypes = [
    "Multi-specialty",
    "General",
    "Government",
    "Private",
    "Specialty"
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Title */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#e0f2fe",
              color: "var(--brand-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Hospital size={20} />
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
            Hospital Profile & Verification
          </h1>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
          Manage your hospital's operational registration, emergency contact lines, and public facility details.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            color: "#166534",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span>Hospital profile updated and saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Core Identity */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "1.25rem" }}>
            Hospital Identity & Classification
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Hospital Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hospital Type *</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {hospitalTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Status *</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE (Accepting Emergencies)</option>
                <option value="DIVERTING">DIVERTING (Full / Critical Diversion)</option>
                <option value="MAINTENANCE">MAINTENANCE (Partial Service)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Licensed Beds *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={form.totalBeds}
                onChange={(e) => setForm({ ...form, totalBeds: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Established Year</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2008"
                value={form.establishedYear}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "1.25rem" }}>
            Location & Physical Address
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Street name, landmark, locality"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 411016"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Emergency Helpline & Communications */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "1.25rem" }}>
            Emergency Contact Numbers & Digital Presence
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Emergency Helpline (Direct Line) *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. +91 20 2567 8999"
                value={form.emergencyPhone}
                onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
              />
              <span className="form-hint">Dialed by patients during 1-click calls</span>
            </div>

            <div className="form-group">
              <label className="form-label">General Hospital Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 20 2567 8900"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Contact Email *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="e.g. emergency@carehospital.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://carehospital.org"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Hospital Description */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "1.25rem" }}>
            Hospital Overview & Emergency Capabilities Description
          </h2>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide an overview of emergency department capabilities, trauma bays, cardiac catheterization labs, etc."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div
          style={{
            position: "sticky",
            bottom: "1rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem 1.5rem",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 50
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {isBackendConnected ? "Synchronized directly to Express API & MongoDB." : "Stored locally on device (Demo Mode)."}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ fontWeight: 700, padding: "0.85rem 2rem", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)" }}
          >
            <Save size={18} />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
