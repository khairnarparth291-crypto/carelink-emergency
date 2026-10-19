import React, { useState, useEffect } from "react";
import { X, UserPlus, Save } from "lucide-react";
import { SPECIALIST_TYPES } from "../../data/hospitalPortalData";

export default function DoctorModal({ isOpen, onClose, onSave, doctorToEdit = null }) {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "Cardiologist",
    qualification: "",
    experience: "",
    status: "On Duty",
    onCall: true,
    workingHours: "9 AM – 9 PM",
    phone: ""
  });

  useEffect(() => {
    if (doctorToEdit) {
      setFormData({
        name: doctorToEdit.name || "",
        specialty: doctorToEdit.specialty || "Cardiologist",
        qualification: doctorToEdit.qualification || "",
        experience: doctorToEdit.experience || "",
        status: doctorToEdit.status || "On Duty",
        onCall: doctorToEdit.onCall ?? true,
        workingHours: doctorToEdit.workingHours || "9 AM – 9 PM",
        phone: doctorToEdit.phone || ""
      });
    } else {
      setFormData({
        name: "",
        specialty: "Cardiologist",
        qualification: "MBBS, MD",
        experience: "8 years experience",
        status: "On Duty",
        onCall: true,
        workingHours: "8 AM – 8 PM",
        phone: "+91 98230 "
      });
    }
  }, [doctorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
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
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand-navy)" }}>
                {doctorToEdit ? "Edit Specialist" : "Add New Specialist"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Manage emergency on-duty and on-call specialist roster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{ padding: "0.4rem", color: "var(--text-muted)", borderRadius: "var(--radius-sm)" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Dr. Ramesh Gupta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <select
                className="form-select"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              >
                {SPECIALIST_TYPES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10 years experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Qualification *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. MBBS, MD (Cardiology), DM"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Current Availability *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="On Duty">🟢 On Duty</option>
                <option value="On Call">🟡 On Call</option>
                <option value="Unavailable">🔴 Unavailable</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">On-Call for Emergency?</label>
              <select
                className="form-select"
                value={formData.onCall ? "yes" : "no"}
                onChange={(e) => setFormData({ ...formData, onCall: e.target.value === "yes" })}
              >
                <option value="yes">Yes (Available for emergency escalation)</option>
                <option value="no">No (Routine duty only)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Working Hours / Shift</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8 PM – 8 AM"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Direct Contact Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98230 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: "0.4rem" }}>
              <Save size={16} />
              <span>{doctorToEdit ? "Update Specialist" : "Add Specialist"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
