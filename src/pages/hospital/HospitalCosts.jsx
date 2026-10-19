import React, { useState } from "react";
import { DollarSign, ShieldCheck, AlertTriangle, Save, CheckCircle2, Info } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import { INSURANCE_OPTIONS } from "../../data/hospitalPortalData";

export default function HospitalCosts() {
  const { costs, insurance, updateCostsAndInsurance, isBackendConnected } = useHospitalPortal();

  const [costsForm, setCostsForm] = useState({
    generalBed: costs.generalBed || 3500,
    icu: costs.icu || 8500,
    ventilator: costs.ventilator || 4500,
    emergencyConsultation: costs.emergencyConsultation || 1200,
    specialistConsultation: costs.specialistConsultation || 1500,
    operationTheatre: costs.operationTheatre || 18000,
    minEstimatedCost: costs.minEstimatedCost || 5000,
    maxEstimatedCost: costs.maxEstimatedCost || 10000
  });

  const [selectedInsurance, setSelectedInsurance] = useState([...insurance]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCostChange = (field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCostsForm((prev) => ({ ...prev, [field]: num }));
  };

  const handleInsuranceToggle = (option) => {
    setSelectedInsurance((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCostsAndInsurance(costsForm, selectedInsurance);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
          Cost Management & Insurance Schemes
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Provide transparent tariffs and accepted insurance schemes for emergency family matching.
        </p>
      </div>

      {/* Official Mandatory Warning Notice */}
      <div
        style={{
          backgroundColor: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem"
        }}
      >
        <AlertTriangle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ display: "block", color: "#9a3412", fontSize: "0.9rem", marginBottom: "0.2rem" }}>
            Estimated Hospital Tariff Disclaimer
          </strong>
          <p style={{ fontSize: "0.85rem", color: "#c2410c", lineHeight: 1.45 }}>
            These are estimated hospital-provided charges. Actual treatment costs may vary depending on patient clinical complexity, medicines, diagnostics, surgical procedures, and length of hospital stay.
          </p>
        </div>
      </div>

      {/* Confirmation feedback */}
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
          <span>Cost tariffs & insurance information saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* SECTION 1: Standard Unit Charges */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <DollarSign size={20} color="var(--brand-blue)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              1. Daily Bed & Equipment Charges
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Input standard per-day charges used by the patient cost estimation calculator.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">General Bed (₹ / day)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.generalBed}
                onChange={(e) => handleCostChange("generalBed", e.target.value)}
              />
              <span className="form-hint">Standard ward accommodation</span>
            </div>

            <div className="form-group">
              <label className="form-label">ICU (₹ / day)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.icu}
                onChange={(e) => handleCostChange("icu", e.target.value)}
              />
              <span className="form-hint">Intensive care unit monitoring</span>
            </div>

            <div className="form-group">
              <label className="form-label">Ventilator (₹ / day)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.ventilator}
                onChange={(e) => handleCostChange("ventilator", e.target.value)}
              />
              <span className="form-hint">Mechanical ventilator support charge</span>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Consultation (₹)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.emergencyConsultation}
                onChange={(e) => handleCostChange("emergencyConsultation", e.target.value)}
              />
              <span className="form-hint">Emergency casualty entry assessment</span>
            </div>

            <div className="form-group">
              <label className="form-label">Specialist Consultation (₹)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.specialistConsultation}
                onChange={(e) => handleCostChange("specialistConsultation", e.target.value)}
              />
              <span className="form-hint">On-call super-specialist evaluation</span>
            </div>

            <div className="form-group">
              <label className="form-label">Operation Theatre Charge (₹)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.operationTheatre}
                onChange={(e) => handleCostChange("operationTheatre", e.target.value)}
              />
              <span className="form-hint">Base emergency surgical room fee</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Estimated Daily Emergency Range */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.25rem" }}>
            2. Estimated Overall Emergency Cost Range
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Set minimum and maximum daily emergency care ranges displayed in hospital cards.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Minimum Estimated Daily Cost (₹)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.minEstimatedCost}
                onChange={(e) => handleCostChange("minEstimatedCost", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Estimated Daily Cost (₹)</label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                value={costsForm.maxEstimatedCost}
                onChange={(e) => handleCostChange("maxEstimatedCost", e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}
          >
            <Info size={16} color="var(--brand-blue)" />
            <span>
              Displayed tier preview: <strong>₹{costsForm.minEstimatedCost.toLocaleString()}–₹{costsForm.maxEstimatedCost.toLocaleString()}/day</strong>
            </span>
          </div>
        </div>

        {/* SECTION 3: Insurance and Schemes */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <ShieldCheck size={20} color="var(--brand-teal)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              3. Insurance & Government Schemes Accepted
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Select all healthcare coverage policies honored at your emergency billing desk.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.85rem",
              marginBottom: "1.25rem"
            }}
          >
            {INSURANCE_OPTIONS.map((ins) => {
              const checked = selectedInsurance.includes(ins);
              return (
                <label
                  key={ins}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${checked ? "var(--brand-blue)" : "var(--border-light)"}`,
                    backgroundColor: checked ? "var(--brand-blue-subtle)" : "var(--bg-surface)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: checked ? 600 : 400,
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleInsuranceToggle(ins)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--brand-blue)" }}
                  />
                  <span style={{ color: checked ? "var(--brand-navy)" : "var(--text-main)" }}>
                    {ins}
                  </span>
                </label>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-outline btn-sm"
              style={{ fontWeight: 600 }}
            >
              <span>Save Insurance Information</span>
            </button>
          </div>
        </div>

        {/* Action Button Bar */}
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
            {isBackendConnected ? "Synchronized directly to Express API & MongoDB." : "Stored locally in device storage (Demo Mode)."}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              fontWeight: 700,
              padding: "0.85rem 2rem",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
            }}
          >
            <Save size={18} />
            <span>Save Costs & Insurance</span>
          </button>
        </div>
      </form>
    </div>
  );
}
