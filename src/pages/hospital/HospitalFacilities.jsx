import React, { useState } from "react";
import { Search } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import FacilityCard from "../../components/hospital/FacilityCard";

export default function HospitalFacilities() {
  const { facilities, updateFacility } = useHospitalPortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fac.details && fac.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fac.capacity && fac.capacity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || fac.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const availableCount = facilities.filter((f) => f.status === "Available").length;
  const limitedCount = facilities.filter((f) => f.status === "Limited").length;
  const unavailCount = facilities.filter((f) => f.status === "Unavailable").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
          Facility & Unit Management
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Report operational readiness of critical infrastructure, diagnostic imaging, and support services.
        </p>
      </div>

      {/* Facilities Overview Summary Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--brand-blue)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Units Tracked</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-navy)", marginTop: "2px" }}>
            {facilities.length}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-available)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🟢 Fully Operational</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-available)", marginTop: "2px" }}>
            {availableCount}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-limited)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🟡 Limited Capacity</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-limited)", marginTop: "2px" }}>
            {limitedCount}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-unavailable)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🔴 Offline / Unavailable</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-unavailable)", marginTop: "2px" }}>
            {unavailCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between"
        }}
      >
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.4rem" }}
            placeholder="Search facility by name or equipment details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Status:</label>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "150px", padding: "0.5rem 0.85rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Limited">Limited (Yellow)</option>
            <option value="Unavailable">Unavailable (Red)</option>
          </select>
        </div>
      </div>

      {/* Facility Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {filteredFacilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onUpdate={updateFacility}
          />
        ))}
      </div>
    </div>
  );
}
