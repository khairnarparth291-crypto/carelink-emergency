import React from "react";
import { Search, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

export default function FilterPanel({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  activeFilters,
  onFilterChange,
  onResetFilters,
  isOpen,
  onToggleOpen
}) {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {/* Top Search & Filter Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.85rem",
        backgroundColor: "var(--bg-surface)",
        padding: "0.85rem 1rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)"
      }}>
        {/* Search Input */}
        <div style={{
          position: "relative",
          flex: "1 1 260px",
          display: "flex",
          alignItems: "center"
        }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "0.85rem", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search hospital by name, area (e.g. Baner, Sassoon)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "2.4rem", height: "42px", fontSize: "0.9rem" }}
            id="hospital-search-input"
          />
        </div>

        {/* Sort and Filter Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* Sort Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <label htmlFor="sort-select" style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="form-select"
              style={{
                width: "auto",
                height: "42px",
                padding: "0.4rem 0.85rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--brand-navy)"
              }}
            >
              <option value="best-match">Best Match</option>
              <option value="nearest">Nearest First</option>
              <option value="fastest-eta">Fastest ETA</option>
              <option value="lowest-cost">Lowest Estimated Cost</option>
              <option value="recently-verified">Recently Verified</option>
            </select>
          </div>

          {/* Toggle Filter Panel Button */}
          <button
            onClick={onToggleOpen}
            className={`btn ${isOpen || activeCount > 0 ? "btn-primary" : "btn-outline"}`}
            style={{ height: "42px", padding: "0.4rem 0.95rem", fontSize: "0.88rem" }}
            id="toggle-filter-btn"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeCount > 0 && (
              <span style={{
                background: isOpen ? "#ffffff" : "var(--brand-blue)",
                color: isOpen ? "var(--brand-blue)" : "#ffffff",
                fontSize: "0.72rem",
                fontWeight: 700,
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "2px"
              }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Quick Filter Drawer */}
      {isOpen && (
        <div style={{
          backgroundColor: "#f8fafc",
          border: "1px solid var(--border-light)",
          borderTop: "none",
          borderBottomLeftRadius: "var(--radius-lg)",
          borderBottomRightRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginTop: "-2px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem"
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              Filter Hospitals By Capability:
            </span>
            {activeCount > 0 && (
              <button
                onClick={onResetFilters}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--brand-blue)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontWeight: 600
                }}
              >
                <RotateCcw size={13} />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

          {/* Quick Checkbox Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[
              { key: "icu", label: "ICU available (> 0 beds)" },
              { key: "ventilator", label: "Ventilator available" },
              { key: "emergencyCare", label: "Emergency casualty active" },
              { key: "bloodBank", label: "In-house Blood Bank" },
              { key: "specialist", label: "Requested Specialist available" },
              { key: "insurance", label: "Selected Insurance accepted" }
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterChange(f.key, !activeFilters[f.key])}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  backgroundColor: activeFilters[f.key] ? "var(--brand-blue)" : "var(--bg-surface)",
                  color: activeFilters[f.key] ? "#ffffff" : "var(--text-main)",
                  border: `1px solid ${activeFilters[f.key] ? "var(--brand-blue)" : "var(--border-medium)"}`
                }}
              >
                {activeFilters[f.key] && <Check size={13} strokeWidth={3} />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
