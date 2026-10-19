import React, { useState } from "react";
import {
  BedDouble,
  Activity,
  Wind,
  ShieldAlert,
  Save,
  CheckCircle2,
  Clock,
  Droplet,
  Crosshair
} from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import AvailabilityStatus from "../../components/hospital/AvailabilityStatus";

export default function HospitalAvailability() {
  const { rawBeds, operationTheatre, bloodBank, hospital, updateBeds, isBackendConnected } = useHospitalPortal();

  // Local state initialized with current context data
  const [bedsForm, setBedsForm] = useState({
    general: {
      total: rawBeds.general.total,
      occupied: rawBeds.general.occupied
    },
    icu: {
      total: rawBeds.icu.total,
      occupied: rawBeds.icu.occupied
    },
    ventilators: {
      total: rawBeds.ventilators.total,
      occupied: rawBeds.ventilators.occupied
    },
    emergency: {
      total: rawBeds.emergency.total,
      occupied: rawBeds.emergency.occupied
    }
  });

  const [otForm, setOtForm] = useState({
    available: operationTheatre.available,
    activeCount: operationTheatre.activeCount,
    total: operationTheatre.total
  });

  const [bloodForm, setBloodForm] = useState({
    status: bloodBank.status,
    lastAudited: bloodBank.lastAudited || "Just now",
    groups: { ...bloodBank.groups }
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Sync state when backend data loads into context
  React.useEffect(() => {
    setBedsForm({
      general: { total: rawBeds.general.total, occupied: rawBeds.general.occupied },
      icu: { total: rawBeds.icu.total, occupied: rawBeds.icu.occupied },
      ventilators: { total: rawBeds.ventilators.total, occupied: rawBeds.ventilators.occupied },
      emergency: { total: rawBeds.emergency.total, occupied: rawBeds.emergency.occupied }
    });
  }, [rawBeds]);

  React.useEffect(() => {
    setOtForm({
      available: operationTheatre.available,
      activeCount: operationTheatre.activeCount,
      total: operationTheatre.total
    });
  }, [operationTheatre]);

  React.useEffect(() => {
    setBloodForm({
      status: bloodBank.status,
      lastAudited: bloodBank.lastAudited || "Just now",
      groups: { ...bloodBank.groups }
    });
  }, [bloodBank]);

  // Auto-calculated availability values
  const generalAvail = Math.max(0, Number(bedsForm.general.total) - Number(bedsForm.general.occupied));
  const icuAvail = Math.max(0, Number(bedsForm.icu.total) - Number(bedsForm.icu.occupied));
  const ventAvail = Math.max(0, Number(bedsForm.ventilators.total) - Number(bedsForm.ventilators.occupied));
  const emergencyAvail = Math.max(0, Number(bedsForm.emergency.total) - Number(bedsForm.emergency.occupied));

  const handleBedChange = (type, field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setValidationError("");
    setBedsForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: num
      }
    }));
  };

  const handleBloodGroupChange = (group, units) => {
    const num = Math.max(0, parseInt(units, 10) || 0);
    setBloodForm((prev) => ({
      ...prev,
      groups: {
        ...prev.groups,
        [group]: num
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validate bed counts against negative values and occupancy exceeding total
    const categories = [
      { key: "general", label: "General Beds" },
      { key: "icu", label: "ICU Beds" },
      { key: "ventilators", label: "Ventilators" },
      { key: "emergency", label: "Emergency Beds" }
    ];

    for (const cat of categories) {
      const tot = Number(bedsForm[cat.key]?.total) || 0;
      const occ = Number(bedsForm[cat.key]?.occupied) || 0;
      if (tot < 0 || occ < 0) {
        setValidationError(`${cat.label} counts cannot be negative.`);
        return;
      }
      if (occ > tot) {
        setValidationError(`Occupied ${cat.label} (${occ}) cannot exceed total capacity (${tot}).`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateBeds(bedsForm, otForm, bloodForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setValidationError(err.message || "Failed to update bed counts on backend.");
    } finally {
      setIsSaving(false);
    }
  };

  const bloodGroupsList = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Validation Error Banner */}
      {validationError && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1.25rem",
            color: "#991b1b",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontWeight: 600
          }}
        >
          <ShieldAlert size={18} color="#dc2626" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Offline Demo Fallback Banner */}
      {!isBackendConnected && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde047",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1.25rem",
            color: "#92400e",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontWeight: 600
          }}
        >
          <ShieldAlert size={18} color="#d97706" />
          <span>Backend unavailable — showing demo data</span>
        </div>
      )}
      {/* Top Banner Notice */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde047",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              backgroundColor: "#ca8a04",
              color: "#ffffff",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.15rem 0.45rem",
              borderRadius: "4px"
            }}
          >
            {isBackendConnected ? "LIVE CONNECTED" : "OFFLINE CACHE"}
          </span>
          <span style={{ fontSize: "0.85rem", color: isBackendConnected ? "#065f46" : "#854d0e", fontWeight: 500 }}>
            {isBackendConnected ? "Availability is synchronized with CareLink API & MongoDB." : "Changes are stored locally on this device (offline cache)."}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#854d0e" }}>
          <Clock size={14} />
          <span>Last verified: <strong>{hospital.lastUpdated}</strong></span>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
          Update Emergency Availability
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Adjust current bed counts, critical equipment status, OT readiness, and blood bank units.
        </p>
      </div>

      {/* Confirmation Banner if saved */}
      {submitted && (
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
          <span>Availability updated successfully. Last verified: Just now</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* SECTION 1: Bed Capacity & Critical Support */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.25rem" }}>
            1. Bed & Ventilator Capacity
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Available beds are <strong>automatically calculated</strong> as (Total - Occupied).
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem"
            }}
          >
            {/* General Beds */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BedDouble size={18} color="var(--brand-blue)" />
                  <strong style={{ color: "var(--brand-navy)", fontSize: "1rem" }}>General Beds</strong>
                </div>
                <AvailabilityStatus available={generalAvail} total={bedsForm.general.total} size="sm" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Total</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.general.total}
                    onChange={(e) => handleBedChange("general", "total", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Occupied</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.general.occupied}
                    onChange={(e) => handleBedChange("general", "occupied", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Available (Auto):</span>
                <strong style={{ fontSize: "1.1rem", color: generalAvail > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                  {generalAvail}
                </strong>
              </div>
            </div>

            {/* ICU Beds */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Activity size={18} color="var(--brand-teal)" />
                  <strong style={{ color: "var(--brand-navy)", fontSize: "1rem" }}>ICU Beds</strong>
                </div>
                <AvailabilityStatus available={icuAvail} total={bedsForm.icu.total} size="sm" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Total</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.icu.total}
                    onChange={(e) => handleBedChange("icu", "total", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Occupied</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.icu.occupied}
                    onChange={(e) => handleBedChange("icu", "occupied", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Available (Auto):</span>
                <strong style={{ fontSize: "1.1rem", color: icuAvail > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                  {icuAvail}
                </strong>
              </div>
            </div>

            {/* Ventilators */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Wind size={18} color="#0284c7" />
                  <strong style={{ color: "var(--brand-navy)", fontSize: "1rem" }}>Ventilators</strong>
                </div>
                <AvailabilityStatus available={ventAvail} total={bedsForm.ventilators.total} size="sm" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Total</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.ventilators.total}
                    onChange={(e) => handleBedChange("ventilators", "total", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Occupied</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.ventilators.occupied}
                    onChange={(e) => handleBedChange("ventilators", "occupied", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Available (Auto):</span>
                <strong style={{ fontSize: "1.1rem", color: ventAvail > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                  {ventAvail}
                </strong>
              </div>
            </div>

            {/* Emergency Beds */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShieldAlert size={18} color="var(--emergency-red)" />
                  <strong style={{ color: "var(--brand-navy)", fontSize: "1rem" }}>Emergency Beds</strong>
                </div>
                <AvailabilityStatus available={emergencyAvail} total={bedsForm.emergency.total} size="sm" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Total</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.emergency.total}
                    onChange={(e) => handleBedChange("emergency", "total", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Occupied</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    value={bedsForm.emergency.occupied}
                    onChange={(e) => handleBedChange("emergency", "occupied", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Available (Auto):</span>
                <strong style={{ fontSize: "1.1rem", color: emergencyAvail > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                  {emergencyAvail}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Operation Theatres */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Crosshair size={20} color="var(--brand-navy)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              2. Operation Theatre (OT) Readiness
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Report emergency surgical suite availability for acute trauma, cardiovascular, and general surgery.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">OT Available?</label>
              <select
                className="form-select"
                value={otForm.available ? "yes" : "no"}
                onChange={(e) => setOtForm({ ...otForm, available: e.target.value === "yes" })}
              >
                <option value="yes">Yes — Emergency OTs Active</option>
                <option value="no">No — OTs Full / Sanitization</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Available OTs</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={otForm.activeCount}
                onChange={(e) => setOtForm({ ...otForm, activeCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total OT Suites</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={otForm.total}
                onChange={(e) => setOtForm({ ...otForm, total: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Blood Bank */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Droplet size={20} color="var(--emergency-red)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              3. Blood Bank Availability & Units
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Provide real-time unit counts across all 8 major blood group categories.
          </p>

          <div className="form-group" style={{ maxWidth: "300px", marginBottom: "1.5rem" }}>
            <label className="form-label">Blood Bank Overall Status</label>
            <select
              className="form-select"
              value={bloodForm.status}
              onChange={(e) => setBloodForm({ ...bloodForm, status: e.target.value })}
            >
              <option value="Available">🟢 Available</option>
              <option value="Limited">🟡 Limited</option>
              <option value="Unavailable">🔴 Unavailable</option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "0.85rem"
            }}
          >
            {bloodGroupsList.map((bg) => (
              <div
                key={bg}
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--emergency-red)", marginBottom: "0.35rem" }}>
                  {bg}
                </div>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ textAlign: "center", padding: "0.4rem" }}
                  value={bloodForm.groups[bg] ?? 0}
                  onChange={(e) => handleBloodGroupChange(bg, e.target.value)}
                />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Units
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button Bar */}
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
            {isBackendConnected ? "Synchronized directly to Express API & MongoDB." : "Stored locally in device memory (Demo Mode)."}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary btn-lg"
            style={{
              fontWeight: 700,
              padding: "0.85rem 2rem",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? "not-allowed" : "pointer"
            }}
          >
            <Save size={18} />
            <span>{isSaving ? "Updating Availability..." : "Update Availability"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
