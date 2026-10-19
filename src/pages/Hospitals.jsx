import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Search
} from "lucide-react";
import { HOSPITALS } from "../data/hospitals";
import { filterAndSortHospitals } from "../utils/matching";
import { mapBackendHospitalsList } from "../utils/hospitalMapper";
import { useEmergency } from "../context/EmergencyContext";
import RequirementSummary from "../components/RequirementSummary";
import FilterPanel from "../components/FilterPanel";
import HospitalCard from "../components/HospitalCard";
import api from "../services/api";

export default function Hospitals() {
  const location = useLocation();
  const { requirements } = useEmergency();

  // Hospital dataset state (live backend or demo fallback)
  const [hospitals, setHospitals] = useState(() =>
    mapBackendHospitalsList(null, HOSPITALS, requirements?.location)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Search, sort & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("best-match");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    icu: false,
    ventilator: false,
    emergencyCare: false,
    bloodBank: false,
    specialist: false,
    insurance: false
  });

  const reqLocation = requirements?.location;

  // Fetch live hospital dataset from backend
  const fetchLiveHospitals = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);

    const locationQuery = typeof reqLocation === "string" ? reqLocation.trim() : (reqLocation?.address || reqLocation?.city || "");

    try {
      const res = await api.getHospitals(locationQuery ? { city: locationQuery } : {});
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = mapBackendHospitalsList(res.data, HOSPITALS, locationQuery);
        setHospitals(mapped);
        setIsBackendLive(true);
      } else {
        throw new Error(res?.message || "Invalid hospital records response");
      }
    } catch (err) {
      console.warn("Could not load live hospital data from backend:", err.message);
      // Resilient fallback to demo data with location filter strictly applied
      const fallback = mapBackendHospitalsList(null, HOSPITALS, locationQuery);
      setHospitals(fallback);
      setIsBackendLive(false);
      setBackendError("Live casualty network currently unreachable. Showing demo hospital records.");
    } finally {
      setIsLoading(false);
    }
  }, [reqLocation]);

  useEffect(() => {
    fetchLiveHospitals();
  }, [fetchLiveHospitals]);

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setActiveFilters({
      icu: false,
      ventilator: false,
      emergencyCare: false,
      bloodBank: false,
      specialist: false,
      insurance: false
    });
    setSearchQuery("");
  };

  // Run matching and filtering on live or fallback hospitals
  const allResults = filterAndSortHospitals(
    hospitals,
    requirements,
    { ...activeFilters, searchQuery },
    sortOption
  );

  // Divide into exact matches and alternative matches
  const exactMatches = allResults.filter((r) => r.isExactMatch);
  const alternativeMatches = allResults.filter((r) => !r.isExactMatch);

  const submittedRequestId = location.state?.submittedRequestId;

  return (
    <div style={{ padding: "2.5rem 0 5rem", backgroundColor: "var(--bg-page)", minHeight: "80vh" }}>
      <div className="container">

        {/* Page Title */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", color: "var(--brand-navy)", marginBottom: "0.35rem" }}>
            Hospitals Matching Your Requirements
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Hospital reported readiness ranked by requirements matched, verified bed availability, and live travel time.
          </p>
        </div>

        {/* Optional: Notice if redirected from newly submitted emergency triage request */}
        {submittedRequestId && (
          <div style={{
            backgroundColor: "#ecfdf5",
            border: "1.5px solid #a7f3d0",
            borderRadius: "var(--radius-lg)",
            padding: "0.85rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <div>
                <strong style={{ color: "#065f46", fontSize: "0.95rem" }}>
                  Emergency Case #{submittedRequestId} Dispatched to Triage Network
                </strong>
                <p style={{ color: "#047857", fontSize: "0.82rem", margin: 0 }}>
                  Hospital reported readiness ranked below. Please phone the casualty desk to reserve critical admission.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link
                to={`/emergency-status/${submittedRequestId}`}
                className="btn btn-sm"
                style={{
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.8rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  textDecoration: "none"
                }}
                id="banner-track-request-btn"
              >
                <span>Track Emergency Request</span>
              </Link>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.2rem 0.65rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "#d1fae5",
                color: "#065f46",
                border: "1px solid #6ee7b7"
              }}>
                STATUS: PENDING
              </span>
            </div>
          </div>
        )}

        {/* Live vs Demo Network Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          padding: "0.6rem 1rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: isBackendLive ? "#f0fdf4" : "#fffbeb",
          border: `1px solid ${isBackendLive ? "#bbf7d0" : "#fef3c7"}`,
          fontSize: "0.82rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {isBackendLive ? (
              <>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a", boxShadow: "0 0 6px rgba(22, 163, 74, 0.6)" }} />
                <strong style={{ color: "#166534" }}>LIVE BACKEND DATA:</strong>
                <span style={{ color: "#15803d" }}>Synchronized live with hospital operations desk REST API.</span>
              </>
            ) : (
              <>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d97706" }} />
                <strong style={{ color: "#92400e" }}>DEMO DATA (Offline Fallback):</strong>
                <span style={{ color: "#78350f" }}>{backendError || "Live casualty server unreachable. Showing demo hospital records."}</span>
              </>
            )}
          </div>
          <button
            onClick={fetchLiveHospitals}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            title="Refresh hospital availability from server"
          >
            <RotateCcw size={12} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Top Requirement Summary */}
        <RequirementSummary requirements={requirements} />

        {/* Search, Sort and Filter Bar */}
        <FilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={isFilterPanelOpen}
          onToggleOpen={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        />

        {/* Loading Screen */}
        {isLoading ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "5rem 2rem",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-light)",
            textAlign: "center"
          }}>
            <Loader2 size={44} color="var(--brand-blue)" className="spinner" style={{ animation: "spin 1s linear infinite", marginBottom: "1.25rem" }} />
            <h2 style={{ fontSize: "1.35rem", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
              Finding hospitals that match your requirements...
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "460px" }}>
              Querying verified bed inventories, on-duty specialists, and travel times across {typeof requirements?.location === "string" ? requirements.location : (requirements?.location?.address || "registered")} hospitals.
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div>
            {/* Case 1: No results at all match the search/filters */}
            {allResults.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "4rem 2rem",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)"
              }}
              id="no-hospitals-found"
              >
                <AlertTriangle size={48} color="var(--status-limited)" style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>
                  {requirements?.location
                    ? `No hospitals found in ${typeof requirements.location === "object" ? (requirements.location.address || "your area") : requirements.location}`
                    : "No hospitals match your exact search criteria"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  {requirements?.location
                    ? `We could not find any registered hospitals matching "${typeof requirements.location === "object" ? (requirements.location.address || "your area") : requirements.location}". Please check the spelling or search another city.`
                    : "Try removing search keywords or relaxing capability filters to see available hospitals."}
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={handleResetFilters} className="btn btn-secondary">
                    <RotateCcw size={16} />
                    <span>Reset All Filters</span>
                  </button>
                  <Link to="/find-hospital" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
                    <Search size={16} />
                    <span>Search Different Location</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                {/* Exact Matches Section */}
                {exactMatches.length > 0 && (
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.25rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "var(--status-available-bg)",
                          color: "var(--status-available)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: "1.25rem", color: "var(--brand-navy)" }}>
                            All Requirements Matched ({exactMatches.length})
                          </h2>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            These hospitals report all selected facilities, specialists, and criteria available
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                      {exactMatches.map((res) => (
                        <HospitalCard key={res.hospital.id} matchResult={res} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Case when NO hospital matches ALL selected requirements */}
                {exactMatches.length === 0 && (
                  <div style={{
                    backgroundColor: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem"
                  }}>
                    <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ color: "#92400e", fontSize: "1rem", display: "block", marginBottom: "0.25rem" }}>
                        No hospital currently matches all selected requirements.
                      </strong>
                      <p style={{ color: "#78350f", fontSize: "0.88rem", lineHeight: 1.5 }}>
                        Below are alternative hospitals that match most of your needs. We clearly highlight which requirement is missing (e.g. Ventilator ✕ or Specialist ✕) so you can make an informed decision without delay.
                      </p>
                    </div>
                  </div>
                )}

                {/* Alternative Hospitals Section */}
                {alternativeMatches.length > 0 && (
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1.25rem",
                      borderTop: exactMatches.length > 0 ? "1px solid var(--border-light)" : "none",
                      paddingTop: exactMatches.length > 0 ? "2rem" : 0
                    }}>
                      <h2 style={{ fontSize: "1.25rem", color: "var(--brand-navy)" }}>
                        {exactMatches.length === 0 ? "Alternative Hospitals" : `Partially Matching Alternatives (${alternativeMatches.length})`}
                      </h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                      {alternativeMatches.map((res) => (
                        <HospitalCard key={res.hospital.id} matchResult={res} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
