import React, { useState } from "react";
import { UserPlus, Search, Users } from "lucide-react";
import { useHospitalPortal } from "../../context/HospitalPortalContext";
import { SPECIALIST_TYPES } from "../../data/hospitalPortalData";
import DoctorCard from "../../components/hospital/DoctorCard";
import DoctorModal from "../../components/hospital/DoctorModal";

export default function HospitalDoctors() {
  const {
    doctors,
    addDoctor,
    updateDoctor,
    toggleDoctorAvailability,
    deleteDoctor
  } = useHospitalPortal();

  const [modalOpen, setModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleOpenAdd = () => {
    setDoctorToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setDoctorToEdit(doc);
    setModalOpen(true);
  };

  const handleSaveDoctor = (docData) => {
    if (doctorToEdit) {
      updateDoctor(doctorToEdit.id, docData);
    } else {
      addDoctor(docData);
    }
  };

  // Filtered doctors list
  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSpecialty =
      filterSpecialty === "all" || doc.specialty.toLowerCase() === filterSpecialty.toLowerCase();

    const matchStatus =
      filterStatus === "all" || doc.status.toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchSpecialty && matchStatus;
  });

  const onDutyCount = doctors.filter((d) => d.status === "On Duty").length;
  const onCallCount = doctors.filter((d) => d.status === "On Call").length;
  const unavailCount = doctors.filter((d) => d.status === "Unavailable").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem"
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-navy)" }}>
            Doctor & Specialist Management
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Maintain on-duty rosters, emergency on-call coverage, and surgeon readiness.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ gap: "0.5rem", fontWeight: 700, padding: "0.75rem 1.4rem" }}
        >
          <UserPlus size={18} />
          <span>Add Specialist</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--brand-blue)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Specialists</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-navy)", marginTop: "2px" }}>
            {doctors.length}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-available)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🟢 Currently On Duty</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-available)", marginTop: "2px" }}>
            {onDutyCount}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-limited)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🟡 Emergency On-Call</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-limited)", marginTop: "2px" }}>
            {onCallCount}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--status-unavailable)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🔴 Unavailable / Off</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--status-unavailable)", marginTop: "2px" }}>
            {unavailCount}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
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
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.4rem" }}
            placeholder="Search doctor by name, specialty, or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
        </div>

        {/* Filter by Specialty */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Specialty:</label>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "160px", padding: "0.5rem 0.85rem" }}
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            <option value="all">All Specialties</option>
            {SPECIALIST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Status:</label>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "130px", padding: "0.5rem 0.85rem" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="On Duty">On Duty</option>
            <option value="On Call">On Call</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "3rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
          }}
        >
          <Users size={40} color="var(--text-muted)" />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-navy)" }}>
              No specialists found
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Try adjusting your search criteria or add a new specialist.
            </p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <UserPlus size={15} />
            <span>Add Specialist</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem"
          }}
        >
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onEdit={handleOpenEdit}
              onToggleAvailability={toggleDoctorAvailability}
              onDelete={deleteDoctor}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <DoctorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveDoctor}
        doctorToEdit={doctorToEdit}
      />
    </div>
  );
}
