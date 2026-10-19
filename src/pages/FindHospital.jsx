import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Bed, HeartPulse, CreditCard, Building } from "lucide-react";
import { FACILITY_OPTIONS, SPECIALIST_OPTIONS, BUDGET_TIERS, INSURANCE_OPTIONS } from "../data/hospitals";
import { useEmergency } from "../context/EmergencyContext";

export default function FindHospital() {
  const navigate = useNavigate();
  const { updateRequirements } = useEmergency();

  const [location, setLocation] = useState("Pune, Maharashtra");
  const [facility, setFacility] = useState("ICU");
  const [specialist, setSpecialist] = useState("No specific specialist");
  const [budget, setBudget] = useState("any");
  const [insurance, setInsurance] = useState("Private Insurance");

  const handleSearch = (e) => {
    e.preventDefault();

    updateRequirements({
      location,
      facilities: facility === "Any" ? ["General Bed"] : [facility],
      specialist,
      budget,
      insurance,
      emergencyType: "General Medical Admission",
      age: "",
      gender: ""
    });

    navigate("/hospitals");
  };

  return (
    <div style={{ padding: "3.5rem 0 5rem", backgroundColor: "var(--bg-page)" }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "var(--brand-blue-subtle)",
            color: "var(--brand-blue)",
            padding: "0.3rem 0.85rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.82rem",
            fontWeight: 700,
            marginBottom: "0.75rem"
          }}>
            <Building size={15} />
            <span>PLANNED & ELECTIVE SEARCH</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
            Find a Hospital
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: "560px", margin: "0 auto" }}>
            Search hospital facilities, specialist doctors, and bed availability for non-critical admissions across Maharashtra (Mumbai, Pune, and more).
          </p>
        </div>

        {/* Clean Non-Emergency Card Form */}
        <div className="card" style={{ padding: "2.25rem" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Location */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="search-location" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MapPin size={16} color="var(--brand-teal)" />
                <span>Location</span>
              </label>
              <input
                id="search-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or area (e.g. Mumbai, Pune)"
                className="form-input"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
              {/* Required Facility */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="search-facility" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Bed size={16} color="var(--brand-blue)" />
                  <span>Required Facility</span>
                </label>
                <select
                  id="search-facility"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="form-select"
                >
                  <option value="Any">Any Available Bed</option>
                  {FACILITY_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialist */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="search-specialist" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <HeartPulse size={16} color="var(--emergency-red)" />
                  <span>Specialist Required</span>
                </label>
                <select
                  id="search-specialist"
                  value={specialist}
                  onChange={(e) => setSpecialist(e.target.value)}
                  className="form-select"
                >
                  {SPECIALIST_OPTIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="search-budget" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <CreditCard size={16} color="var(--brand-teal)" />
                  <span>Budget</span>
                </label>
                <select
                  id="search-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-select"
                >
                  {BUDGET_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Insurance */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="search-insurance" className="form-label">
                  Insurance / Scheme
                </label>
                <select
                  id="search-insurance"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="form-select"
                >
                  {INSURANCE_OPTIONS.map((ins) => (
                    <option key={ins} value={ins}>
                      {ins}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", maxWidth: "300px" }}
                id="search-hospitals-btn"
              >
                <Search size={18} />
                <span>Search Hospitals</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
