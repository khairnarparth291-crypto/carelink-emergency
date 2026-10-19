import React, { createContext, useContext, useState } from "react";

const EmergencyContext = createContext(null);

export const DEFAULT_REQUIREMENTS = {
  age: "52",
  gender: "Male",
  emergencyType: "Cardiac Emergency",
  reportedComplaint: "Chest pain / heart-related symptoms",
  suggestedSpecialist: "Cardiologist",
  facilities: ["ICU", "Ventilator", "Emergency / Trauma Care"],
  specialist: "Cardiologist",
  budget: "₹5,000–₹10,000/day",
  insurance: "Private Insurance",
  location: "Pune, Maharashtra"
};

export function EmergencyProvider({ children }) {
  const [requirements, setRequirements] = useState(DEFAULT_REQUIREMENTS);
  const [hasSubmittedRequest, setHasSubmittedRequest] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // { type: 'call'|'directions', hospital: obj }

  const updateRequirements = (newReqs) => {
    setRequirements((prev) => ({ ...prev, ...newReqs }));
  };

  const resetRequirements = () => {
    setRequirements({
      age: "",
      gender: "",
      emergencyType: "Cardiac Emergency",
      reportedComplaint: "",
      suggestedSpecialist: "",
      facilities: ["ICU"],
      specialist: "No specific specialist",
      budget: "any",
      insurance: "No insurance",
      location: "Pune, Maharashtra"
    });
    setHasSubmittedRequest(false);
  };

  const openCallModal = (hospital) => {
    setActiveModal({ type: "call", hospital });
  };

  const openDirectionsModal = (hospital) => {
    setActiveModal({ type: "directions", hospital });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <EmergencyContext.Provider
      value={{
        requirements,
        updateRequirements,
        resetRequirements,
        hasSubmittedRequest,
        setHasSubmittedRequest,
        activeModal,
        openCallModal,
        openDirectionsModal,
        closeModal
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
}
