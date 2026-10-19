import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Siren, ArrowUpDown, Search } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import EmergencyRequestCard from "../../components/hospital/EmergencyRequestCard";
import ConfirmModal from "../../components/hospital/ConfirmModal";

export default function HospitalEmergencyRequests() {
  const {
    hospital,
    activeHospitalId,
    switchHospital,
    emergencyRequests,
    reviewEmergencyRequest,
    acceptEmergencyRequest,
    rejectEmergencyRequest,
    completeEmergencyRequest,
    refreshEmergencyRequests,
    isBackendConnected
  } = useHospitalPortal();

  const [searchParams] = useSearchParams();

  // Switch hospital desk if hospitalId query parameter is provided
  useEffect(() => {
    const qHid = searchParams.get("hospitalId");
    if (qHid && qHid !== activeHospitalId && switchHospital) {
      switchHospital(qHid);
    }
  }, [searchParams, activeHospitalId, switchHospital]);

  // Active filters and sort state
  const [filterStatus, setFilterStatus] = useState("All"); // All | New | Under Review | Accepted | Cannot Accept | Completed
  const [sortBy, setSortBy] = useState("newest"); // newest | arrival | requiredIcu | requiredSpecialist
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // { type: 'review'|'accept'|'reject'|'complete', request: obj }

  const handleOpenReviewModal = (req) => {
    setActiveModal({ type: "review", request: req });
  };

  const handleOpenAcceptModal = (req) => {
    setActiveModal({ type: "accept", request: req });
  };

  const handleOpenRejectModal = (req) => {
    setActiveModal({ type: "reject", request: req });
  };

  const handleOpenCompleteModal = (req) => {
    setActiveModal({ type: "complete", request: req });
  };

  const handleModalConfirm = (reasonOrNote, optionalNote) => {
    if (!activeModal) return;
    const reqId = activeModal.request.id || activeModal.request._id;

    if (activeModal.type === "review") {
      reviewEmergencyRequest(reqId, reasonOrNote);
    } else if (activeModal.type === "accept") {
      acceptEmergencyRequest(reqId, reasonOrNote);
    } else if (activeModal.type === "reject") {
      rejectEmergencyRequest(reqId, reasonOrNote || "Capacity full", optionalNote);
    } else if (activeModal.type === "complete") {
      completeEmergencyRequest(reqId, reasonOrNote);
    }
    setActiveModal(null);
  };

  // Filter logic
  const filteredList = emergencyRequests.filter((req) => {
    // Status filter
    if (filterStatus !== "All") {
      if (filterStatus === "New") {
        if (req.status !== "New" && req.status !== "Pending") return false;
      } else if (filterStatus === "Under Review") {
        if (req.status !== "Under Review" && req.rawStatus !== "UNDER_REVIEW") return false;
      } else if (filterStatus === "Accepted") {
        if (req.status !== "Accepted" && req.rawStatus !== "ACCEPTED") return false;
      } else if (filterStatus === "Cannot Accept") {
        if (req.status !== "Cannot Accept" && req.rawStatus !== "REJECTED") return false;
      } else if (filterStatus === "Completed") {
        if (req.status !== "Completed" && req.rawStatus !== "COMPLETED") return false;
      } else if (req.status !== filterStatus) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (req.id && req.id.toLowerCase().includes(q)) ||
        (req.emergencyType && req.emergencyType.toLowerCase().includes(q)) ||
        (req.locationInfo?.displayText && req.locationInfo.displayText.toLowerCase().includes(q)) ||
        (typeof req.location === "string" && req.location.toLowerCase().includes(q)) ||
        (req.location?.address && req.location.address.toLowerCase().includes(q)) ||
        (req.patientName && req.patientName.toLowerCase().includes(q)) ||
        (req.symptoms && req.symptoms.toLowerCase().includes(q)) ||
        req.requiredFacilities?.some((f) => f.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Sort logic
  const sortedList = [...filteredList].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (b.timestamp || 0) - (a.timestamp || 0);
      case "arrival": {
        const getEtaNum = (str) => parseInt(str, 10) || 999;
        return getEtaNum(a.estimatedArrival) - getEtaNum(b.estimatedArrival);
      }
      case "requiredIcu": {
        const aHasIcu = a.requiredFacilities?.includes("ICU") ? 1 : 0;
        const bHasIcu = b.requiredFacilities?.includes("ICU") ? 1 : 0;
        return bHasIcu - aHasIcu;
      }
      case "requiredSpecialist": {
        const aHasSpec = a.requiredFacilities?.some((f) => f.includes("ist") || f.includes("Surgeon")) ? 1 : 0;
        const bHasSpec = b.requiredFacilities?.some((f) => f.includes("ist") || f.includes("Surgeon")) ? 1 : 0;
        return bHasSpec - aHasSpec;
      }
      default:
        return 0;
    }
  });

  const countAll = emergencyRequests.length;
  const countNew = emergencyRequests.filter((r) => r.status === "New" || r.status === "Pending").length;
  const countUnderReview = emergencyRequests.filter((r) => r.status === "Under Review" || r.rawStatus === "UNDER_REVIEW").length;
  const countAccepted = emergencyRequests.filter((r) => r.status === "Accepted" || r.rawStatus === "ACCEPTED").length;
  const countRejected = emergencyRequests.filter((r) => r.status === "Cannot Accept" || r.rawStatus === "REJECTED").length;
  const countCompleted = emergencyRequests.filter((r) => r.status === "Completed" || r.rawStatus === "COMPLETED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Title & Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--emergency-light)",
                color: "var(--emergency-red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Siren size={20} />
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
              Incoming Emergency Requests {hospital?.name ? `— ${hospital.name}` : ""}
            </h1>
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
            Managing active emergency queue for <strong>{hospital?.name || "Care Hospital Pune"}</strong> ({hospital?.city || "Pune"}). Review, accept, or specify constraints.
          </p>
        </div>

        {/* Live sync badge & manual refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
          <div
            id="live-feed-indicator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: isBackendConnected ? "#ecfdf5" : "#fffbeb",
              border: `1px solid ${isBackendConnected ? "#a7f3d0" : "#fef3c7"}`,
              color: isBackendConnected ? "#065f46" : "#92400e",
              fontSize: "0.78rem",
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isBackendConnected ? "#10b981" : "#f59e0b",
                display: "inline-block"
              }}
            />
            <span>{isBackendConnected ? "Live Feed (5s)" : "Offline Demo"}</span>
          </div>
          <button
            type="button"
            id="manual-refresh-requests-btn"
            onClick={() => refreshEmergencyRequests && refreshEmergencyRequests()}
            className="btn btn-outline btn-sm"
            style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem", fontWeight: 600 }}
            title="Refresh emergency requests"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        {/* Status Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {[
            { label: "All", count: countAll },
            { label: "New", count: countNew },
            { label: "Under Review", count: countUnderReview },
            { label: "Accepted", count: countAccepted },
            { label: "Cannot Accept", count: countRejected },
            { label: "Completed", count: countCompleted }
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilterStatus(tab.label)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 600,
                backgroundColor: filterStatus === tab.label ? "var(--brand-navy)" : "var(--bg-subtle)",
                color: filterStatus === tab.label ? "#ffffff" : "var(--text-main)",
                transition: "all var(--transition-fast)"
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "999px",
                  backgroundColor: filterStatus === tab.label ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.08)",
                  fontWeight: 700
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", flex: 1, justifyContent: "flex-end" }}>
          <div style={{ position: "relative", minWidth: "220px", maxWidth: "300px", width: "100%" }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.45rem 0.75rem 0.45rem 2.2rem", fontSize: "0.85rem" }}
              placeholder="Filter by case, condition, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={15}
              style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="arrival">Sort: Shortest Arrival Time</option>
              <option value="requiredIcu">Sort: Requires ICU First</option>
              <option value="requiredSpecialist">Sort: Requires Specialist First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Requests List */}
      {sortedList.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "3rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          <Siren size={36} color="var(--text-muted)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)" }}>
            No matching emergency cases
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            There are currently no emergency cases matching your selected status or filter query.
          </p>
          <button onClick={() => { setFilterStatus("All"); setSearchQuery(""); }} className="btn btn-outline btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {sortedList.map((req) => (
            <EmergencyRequestCard
              key={req.id}
              request={req}
              onReview={handleOpenReviewModal}
              onAccept={handleOpenAcceptModal}
              onReject={handleOpenRejectModal}
              onComplete={handleOpenCompleteModal}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {activeModal && (
        <ConfirmModal
          isOpen={Boolean(activeModal)}
          type={activeModal.type}
          requestData={activeModal.request}
          onConfirm={handleModalConfirm}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
