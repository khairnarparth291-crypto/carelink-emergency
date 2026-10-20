import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Siren,
  MapPin,
  Bed,
  User,
  CreditCard,
  ShieldAlert,
  Check,
  Navigation,
  ArrowRight,
  AlertCircle,
  Zap,
  Loader2,
  CheckCircle2,
  Activity,
  Stethoscope,
  Sparkles,
  Phone,
  CheckSquare,
  Square,
  Shield,
  Trash2
} from "lucide-react";
import PatientLocationMap from "../components/PatientLocationMap";
import { getLocationInfo, formatCoordinates } from "../utils/locationHelper";
import {
  EMERGENCY_TYPES,
  FACILITY_OPTIONS,
  BUDGET_TIERS,
  INSURANCE_OPTIONS,
  HOSPITALS
} from "../data/hospitals";
import {
  COMPLAINT_CATEGORIES,
  MANUAL_SPECIALIST_OPTIONS,
  SPECIALIST_DISCLAIMER
} from "../utils/specialistSuggestions";
import { useEmergency } from "../context/EmergencyContext";
import { mapBackendHospitalsList } from "../utils/hospitalMapper";
import { findSpecialistMatch } from "../utils/matching";
import api from "../services/api";

const SLUG_TO_BACKEND_ID = {
  "care-hospital-pune": "670100000000000000000010",
  "apollo-care-pune": "670100000000000000000020",
  "ruby-metro-pune": "670100000000000000000030",
  "lilavati-care-mumbai": "670100000000000000000040",
  "kokilaben-metro-mumbai": "670100000000000000000050",
  "sahyadri-care-deccan": "670100000000000000000060",
  "bharati-medical-dhankawadi": "670100000000000000000070",
  "jupiter-baner-pune": "670100000000000000000080",
  "sancheti-ortho-shivaji": "670100000000000000000090",
  "kem-charity-rasta-peth": "670100000000000000000100",
  "manipal-kharadi-pune": "670100000000000000000110",
  "jehangir-station-pune": "670100000000000000000120"
};

export default function Emergency() {
  const navigate = useNavigate();
  const { requirements, updateRequirements, setHasSubmittedRequest } = useEmergency();

  // Step state: "form" (step 1: input details) or "dispatch" (step 2: select hospitals to contact)
  const [step, setStep] = useState("form");
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [creationError, setCreationError] = useState(null);
  const [selectableHospitals, setSelectableHospitals] = useState([]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState(null);

  // Local form state initialized from context
  const [formData, setFormData] = useState({
    patientName: requirements.patientName || "Sanjay Patil",
    age: requirements.age || "52",
    gender: requirements.gender || "Male",
    contactPhone: requirements.contactPhone || "+91 98230 12345",
    emergencyType: requirements.emergencyType || "Cardiac Emergency",
    reportedComplaint: requirements.reportedComplaint || "Chest pain / heart-related symptoms",
    suggestedSpecialist: requirements.suggestedSpecialist || "Cardiologist",
    facilities: requirements.facilities || ["ICU", "Ventilator", "Emergency / Trauma Care"],
    specialist: requirements.specialist || "Cardiologist",
    budget: requirements.budget || "₹5,000–₹10,000/day",
    insurance: requirements.insurance || "Private Insurance",
    location: requirements.location || "Pune, Maharashtra"
  });

  const [patientLocation, setPatientLocation] = useState(() => {
    return getLocationInfo(requirements.location || "Pune, Maharashtra");
  });
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null); // { type: 'success'|'warning'|'error', message: string, requestId?: string }

  // Facility checkbox toggle
  const toggleFacility = (facilityId) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facilityId);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facilityId)
          : [...prev.facilities, facilityId]
      };
    });
  };

  // Complaint selection handler
  const handleSelectComplaint = (complaint) => {
    const isOther = complaint.id === "other";
    const suggested = complaint.suggestedSpecialist || null;

    setFormData((prev) => ({
      ...prev,
      reportedComplaint: complaint.label,
      suggestedSpecialist: suggested || "",
      specialist: suggested || (isOther ? "No specific specialist" : prev.specialist)
    }));

    if (isOther) {
      setShowManualSelector(false);
    }
  };

  const handleUseSuggestedSpecialist = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      specialist: specialty
    }));
    setShowManualSelector(false);
  };

  const handleChangeSpecialistClick = () => {
    setShowManualSelector((prev) => !prev);
  };

  const handleManualSpecialistChange = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialist: spec
    }));
  };

  // Quick preset loader for rapid triage
  const applyPreset = (type) => {
    if (type === "cardiac") {
      setFormData((prev) => ({
        ...prev,
        emergencyType: "Cardiac Emergency",
        reportedComplaint: "Chest pain / heart-related symptoms",
        suggestedSpecialist: "Cardiologist",
        facilities: ["ICU", "Ventilator", "Emergency / Trauma Care"],
        specialist: "Cardiologist"
      }));
      setShowManualSelector(false);
    } else if (type === "trauma") {
      setFormData((prev) => ({
        ...prev,
        emergencyType: "Accident / Trauma",
        reportedComplaint: "Bone / joint injury or severe musculoskeletal problem",
        suggestedSpecialist: "Orthopedic",
        facilities: ["Emergency / Trauma Care", "Operation Theatre", "Blood Bank", "ICU"],
        specialist: "Orthopedic"
      }));
      setShowManualSelector(false);
    } else if (type === "stroke") {
      setFormData((prev) => ({
        ...prev,
        emergencyType: "Stroke / Neurological",
        reportedComplaint: "Severe headache / seizure / weakness / numbness",
        suggestedSpecialist: "Neurologist",
        facilities: ["ICU", "Emergency / Trauma Care"],
        specialist: "Neurologist"
      }));
      setShowManualSelector(false);
    } else if (type === "breathing") {
      setFormData((prev) => ({
        ...prev,
        emergencyType: "Breathing Problem",
        reportedComplaint: "Breathing difficulty",
        suggestedSpecialist: "Pulmonologist",
        facilities: ["Ventilator", "ICU", "Emergency / Trauma Care"],
        specialist: "Pulmonologist"
      }));
      setShowManualSelector(false);
    }
  };

  // Use My Current Location handler — triggered ONLY when patient clicks button
  const handleUseLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationSuccessMsg(null);

    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      setLocationError("Geolocation is not supported by your browser. Please enter your address manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

        let detectedAddress = "";
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { signal: controller.signal, headers: { Accept: "application/json" } }
          );
          clearTimeout(timeoutId);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            detectedAddress = geoData.display_name || geoData.name || "";
          }
        } catch {
          // Graceful fallback to coordinates display
        }

        const displayAddr = detectedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        const locObj = {
          hasLocation: true,
          hasCoordinates: true,
          latitude: lat,
          longitude: lng,
          address: displayAddr,
          source: "gps",
          accuracy,
          displayText: displayAddr
        };

        setPatientLocation(locObj);
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: lat,
            longitude: lng,
            address: displayAddr,
            source: "gps"
          }
        }));

        setIsLocating(false);
        setLocationSuccessMsg(
          `GPS location captured (${lat.toFixed(4)}, ${lng.toFixed(4)})${accuracy ? ` ±${accuracy}m` : ""}`
        );
      },
      (error) => {
        setIsLocating(false);
        let message = "Unable to retrieve GPS coordinates. Please enter your address manually.";
        if (error.code === 1) { // PERMISSION_DENIED
          message = "Location permission denied. You can manually enter your address below.";
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          message = "Location coordinates unavailable. Please enter your address manually.";
        } else if (error.code === 3) { // TIMEOUT
          message = "Location request timed out. Please enter your address manually.";
        }
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManualAddressChange = (val) => {
    setLocationError(null);
    setLocationSuccessMsg(null);

    const hasText = Boolean(val && val.trim());
    const locObj = {
      hasLocation: hasText,
      hasCoordinates: false, // Manual entry does NOT invent fake coordinates
      latitude: null,
      longitude: null,
      address: val,
      source: "manual",
      displayText: val.trim() || "Location not provided."
    };

    setPatientLocation(locObj);
    setFormData((prev) => ({
      ...prev,
      location: hasText ? {
        latitude: null,
        longitude: null,
        address: val.trim(),
        source: "manual"
      } : null
    }));
  };

  const handleClearLocation = () => {
    setPatientLocation({
      hasLocation: false,
      hasCoordinates: false,
      latitude: null,
      longitude: null,
      address: "",
      source: null,
      displayText: "Location not provided."
    });
    setFormData((prev) => ({
      ...prev,
      location: null
    }));
    setLocationError(null);
    setLocationSuccessMsg(null);
  };

  // Map backend hospital ID
  const getHospitalBackendId = (h) => {
    if (!h) return null;
    const rawId = h._id || SLUG_TO_BACKEND_ID[h.id] || SLUG_TO_BACKEND_ID[h.slug];
    if (rawId && typeof rawId === "string" && /^[0-9a-fA-F]{24}$/.test(rawId)) {
      return rawId;
    }
    if (typeof h.id === "string" && /^[0-9a-fA-F]{24}$/.test(h.id)) {
      return h.id;
    }
    return null;
  };

  const isHospitalDispatchable = (h) => {
    return Boolean(getHospitalBackendId(h));
  };

  const loadHospitalsForDispatch = async (locationStr) => {
    setIsLoadingHospitals(true);
    setDispatchError(null);
    const locAddress = typeof locationStr === "object" && locationStr !== null
      ? (locationStr.address || "")
      : (typeof locationStr === "string" ? locationStr : "");
    const locLower = locAddress.toLowerCase();
    const city = locLower.includes("mumbai") ? "Mumbai" : "Pune";

    try {
      const res = await api.getHospitals({ city });
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = mapBackendHospitalsList(res.data, HOSPITALS, city);
        setSelectableHospitals(mapped);
        const allIds = mapped.map(getHospitalBackendId).filter(Boolean);
        setSelectedHospitalIds(allIds);
      } else {
        const fallback = mapBackendHospitalsList(null, HOSPITALS, city);
        setSelectableHospitals(fallback);
        const allIds = fallback.map(getHospitalBackendId).filter(Boolean);
        setSelectedHospitalIds(allIds);
      }
    } catch {
      const fallback = mapBackendHospitalsList(null, HOSPITALS, city);
      setSelectableHospitals(fallback);
      const allIds = fallback.map(getHospitalBackendId).filter(Boolean);
      setSelectedHospitalIds(allIds);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const toggleHospitalSelection = (h) => {
    const hid = getHospitalBackendId(h);
    if (!hid) {
      setDispatchError(`Network dispatch is not configured for ${h.name || "this hospital"}. Please contact casualty desk directly.`);
      return;
    }
    setDispatchError(null);
    setSelectedHospitalIds((prev) =>
      prev.includes(hid) ? prev.filter((id) => id !== hid) : [...prev, hid]
    );
  };

  const handleSelectAll = () => {
    const allIds = selectableHospitals
      .map(getHospitalBackendId)
      .filter((id) => Boolean(id));
    setSelectedHospitalIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedHospitalIds([]);
  };

  const handleDispatchSelected = async () => {
    const validIds = selectedHospitalIds.filter((id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id));
    if (validIds.length === 0) {
      setDispatchError("Please select at least one hospital with network dispatch available.");
      return;
    }

    setIsDispatching(true);
    setDispatchError(null);

    try {
      const res = await api.dispatchEmergencyRequest(createdRequestId, validIds);
      if (res && res.success) {
        setDispatchSuccessMsg(`Emergency request sent to ${validIds.length} hospital(s).`);
        setTimeout(() => {
          navigate(`/emergency-status/${createdRequestId}`, {
            state: {
              dispatchedCount: validIds.length,
              fromDispatchFlow: true
            }
          });
        }, 1200);
      } else {
        throw new Error(res?.message || "Failed to contact selected hospitals");
      }
    } catch (err) {
      console.warn("Dispatch failed:", err);
      const backendMsg = err?.data?.message || err?.message;
      let msg = "Unable to contact the selected hospitals. Please try again.";
      if (err?.status === 404) {
        msg = "Emergency request not found. Please try submitting again.";
      } else if (err?.status === 400) {
        msg = backendMsg
          ? `Unable to contact selected hospitals: ${backendMsg}`
          : "Some selected hospitals could not be dispatched.";
      }
      setDispatchError(msg);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate inputs
    const errors = {};
    if (!formData.patientName || !formData.patientName.trim()) {
      errors.patientName = "Please enter patient name.";
    }
    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0 || Number(formData.age) > 120) {
      errors.age = "Please enter a valid patient age (1–120).";
    }
    if (!formData.gender) {
      errors.gender = "Please select patient gender.";
    }
    if (formData.facilities.length === 0) {
      errors.facilities = "Please select at least one required facility (e.g. ICU or Emergency Care).";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    setCreationError(null);
    setSubmitFeedback(null);

    // Map required bed type
    let requiredBedType = "Normal";
    if (formData.facilities.includes("ICU")) requiredBedType = "ICU";
    else if (formData.facilities.includes("Ventilator")) requiredBedType = "Ventilator";
    else if (formData.facilities.includes("Emergency / Trauma Care")) requiredBedType = "Emergency";

    // Map location payload: ensure valid structure or null
    let locationPayload = null;
    if (patientLocation.hasCoordinates && patientLocation.latitude !== null && patientLocation.longitude !== null) {
      locationPayload = {
        latitude: patientLocation.latitude,
        longitude: patientLocation.longitude,
        address: patientLocation.address || `${patientLocation.latitude.toFixed(5)}, ${patientLocation.longitude.toFixed(5)}`,
        source: "gps"
      };
    } else if (patientLocation.address && patientLocation.address.trim()) {
      locationPayload = {
        latitude: null,
        longitude: null,
        address: patientLocation.address.trim(),
        source: "manual"
      };
    }

    const payload = {
      patientName: formData.patientName.trim(),
      patientAge: Number(formData.age),
      patientGender: formData.gender,
      emergencyType: formData.emergencyType,
      reportedComplaint: formData.reportedComplaint || "",
      suggestedSpecialist: formData.suggestedSpecialist || "",
      requiredSpecialist: formData.specialist !== "No specific specialist" ? formData.specialist : "",
      requiredFacility: formData.facilities,
      requiredBedType,
      location: locationPayload,
      budget: formData.budget,
      insurance: formData.insurance,
      hospitalIds: [], // Unassigned until user selects hospitals
      message: `Urgent case: ${formData.reportedComplaint ? `${formData.reportedComplaint} — ` : ""}${formData.emergencyType}. Requires ${formData.facilities.join(", ")}.`
    };

    try {
      const res = await api.createEmergencyRequest(payload);
      const caseId = res?.data?._id || res?.data?.id;
      if (res && res.success && caseId) {
        const validId = String(caseId);
        updateRequirements({
          ...formData,
          lastSubmittedRequestId: validId
        });
        setHasSubmittedRequest(true);
        setCreatedRequestId(validId);
        setCreationError(null);
        setStep("dispatch");
        loadHospitalsForDispatch(formData.location);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(res?.message || "Server did not return a valid emergency request ID.");
      }
    } catch (err) {
      console.warn("Emergency request API submission issue:", err.message);
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to create emergency request. Please check your connection and retry.";
      setCreationError(errorMsg);
      // Stay on step "form", retain formData, and do not advance to dispatch
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDispatchStep = () => {
    const locAddress = typeof formData.location === "object" && formData.location !== null
      ? (formData.location.address || "")
      : (typeof formData.location === "string" ? formData.location : "");
    const locLower = locAddress.toLowerCase();
    const patientCity = locLower.includes("mumbai") ? "Mumbai" : "Pune";

    return (
      <div>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1rem"
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            <span>Emergency Request #{createdRequestId} Registered</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.3rem)", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
            Select hospitals to contact
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            Select one or more accredited casualty centers in {patientCity} to contact. Each hospital will receive this emergency request independently.
          </p>
        </div>

        {/* Safety Banner */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1.5px solid #fef3c7",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            fontSize: "0.88rem",
            color: "#92400e"
          }}
        >
          <ShieldAlert size={20} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Emergency Coordination Notice:</strong> This information is for emergency coordination only. Hospital availability can change. Please confirm with the hospital/casualty desk before travelling.
          </div>
        </div>

        {/* Error or Success Alerts */}
        {dispatchError && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#991b1b",
              fontSize: "0.9rem"
            }}
          >
            <AlertCircle size={18} color="#dc2626" />
            <span>{dispatchError}</span>
          </div>
        )}

        {dispatchSuccessMsg && (
          <div
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#065f46",
              fontSize: "0.9rem"
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{dispatchSuccessMsg} Navigating to live status tracking...</span>
          </div>
        )}

        {/* Patient Information Review Summary */}
        <div
          className="card"
          style={{
            backgroundColor: "#f8fafc",
            border: "1.5px solid #e2e8f0",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.85rem",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "0.6rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <User size={18} style={{ color: "var(--brand-blue)" }} />
              <strong style={{ fontSize: "1rem", color: "var(--brand-navy)" }}>
                Patient Triage & Intake Review
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.78rem", color: "var(--brand-blue)", textDecoration: "underline" }}
            >
              Modify Details
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.85rem",
              fontSize: "0.85rem"
            }}
          >
            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Patient
              </span>
              <strong style={{ color: "var(--brand-navy)" }}>{formData.patientName}</strong> ({formData.age}y, {formData.gender})
            </div>

            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Emergency Complaint
              </span>
              <strong style={{ color: "#dc2626" }}>{formData.emergencyType}</strong>
              {formData.reportedComplaint && (
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{formData.reportedComplaint}</div>
              )}
            </div>

            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Contact Phone
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--brand-navy)" }}>
                <Phone size={13} style={{ color: "var(--brand-blue)" }} />
                <span>{formData.contactPhone}</span>
              </div>
            </div>

            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Required Facilities
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "2px" }}>
                {formData.facilities.map((fac) => (
                  <span
                    key={fac}
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 600
                    }}
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Specialist Needed
              </span>
              <strong style={{ color: "#16a34a" }}>
                {formData.specialist || "General / ER Staff"}
              </strong>
            </div>

            <div>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase"
                }}
              >
                Patient Location
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "2px" }}>
                <MapPin
                  size={13}
                  style={{ color: patientLocation.hasCoordinates ? "#059669" : "#64748b" }}
                />
                <span style={{ color: "var(--brand-navy)", fontWeight: 500 }}>
                  {patientLocation.displayText}
                </span>
                {patientLocation.hasCoordinates && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      fontWeight: 700
                    }}
                  >
                    GPS LIVE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar: Select All / Deselect All */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1rem"
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {selectableHospitals.length} hospitals found in {patientCity}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.82rem" }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.82rem" }}
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Hospital Cards List */}
        {isLoadingHospitals ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <Loader2 size={36} className="spin" color="var(--brand-blue)" style={{ margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--text-muted)" }}>Loading casualty centers in {patientCity}...</p>
          </div>
        ) : selectableHospitals.length === 0 ? (
          <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              No hospitals registered in {typeof formData.location === "object" ? (formData.location?.address || "your area") : (formData.location || "your area")}.
            </p>
            <Link to={`/emergency-status/${createdRequestId}`} className="btn btn-primary">
              View Emergency Status
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {selectableHospitals.map((h) => {
              const hid = getHospitalBackendId(h);
              const canDispatch = isHospitalDispatchable(h);
              const isSelected = canDispatch && selectedHospitalIds.includes(hid);
              const specialistMatch = formData.specialist && formData.specialist !== "No specific specialist"
                ? findSpecialistMatch(h.specialists, formData.specialist)
                : null;

              return (
                <div
                  key={hid || h.id || h.name}
                  onClick={() => {
                    if (canDispatch) {
                      toggleHospitalSelection(h);
                    }
                  }}
                  className="card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    cursor: canDispatch ? "pointer" : "default",
                    opacity: canDispatch ? 1 : 0.8,
                    border: isSelected ? "2px solid var(--brand-blue)" : "1px solid var(--border-light)",
                    backgroundColor: isSelected ? "#f0f9ff" : canDispatch ? "#ffffff" : "#f8fafc",
                    boxShadow: isSelected ? "0 4px 14px rgba(2, 132, 199, 0.12)" : "var(--shadow-sm)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem"
                  }}
                >
                  {/* Checkbox Icon */}
                  <div style={{ marginTop: "4px", color: isSelected ? "var(--brand-blue)" : "var(--border-medium)" }}>
                    {isSelected ? (
                      <CheckSquare size={22} color="var(--brand-blue)" />
                    ) : canDispatch ? (
                      <Square size={22} />
                    ) : (
                      <Square size={22} color="#cbd5e1" />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
                          {h.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "3px" }}>
                          <MapPin size={14} color="#0d9488" />
                          <span>{h.address}, {h.city || "Pune"}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#dc2626", fontWeight: 700 }}>
                        <Phone size={14} />
                        <span>{h.emergencyHelpline || h.emergencyPhone || h.phone}</span>
                      </div>
                    </div>

                    {/* Bed Availability & Capabilities */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem", fontSize: "0.78rem" }}>
                      <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 600 }}>
                        ICU Beds: {h.icuBeds?.available ?? 0} avail
                      </span>
                      <span style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 600 }}>
                        Normal Beds: {h.generalBeds?.available ?? h.normalBeds?.available ?? 0} avail
                      </span>
                      <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 600 }}>
                        Ventilators: {h.ventilators?.available ?? 0} avail
                      </span>

                      {specialistMatch && (
                        <span
                          style={{
                            backgroundColor: specialistMatch.isAvailable ? "#dcfce7" : "#f1f5f9",
                            color: specialistMatch.isAvailable ? "#166534" : "#64748b",
                            padding: "0.2rem 0.55rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                            border: `1px solid ${specialistMatch.isAvailable ? "#bbf7d0" : "#cbd5e1"}`
                          }}
                        >
                          {specialistMatch.isAvailable
                            ? `✓ ${formData.specialist} on duty`
                            : `${formData.specialist} not on duty`}
                        </span>
                      )}

                      {!canDispatch && (
                        <span
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            padding: "0.2rem 0.55rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                            border: "1px solid #fde68a"
                          }}
                        >
                          Direct Call Only — Network dispatch not configured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Action Bar */}
        <div
          className="card"
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            backgroundColor: "#ffffff",
            boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.06)",
            borderTop: "2px solid var(--brand-blue)"
          }}
        >
          <div>
            <strong style={{ fontSize: "1.05rem", color: "var(--brand-navy)" }}>
              Selected hospitals: {selectedHospitalIds.length}
            </strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
              Each selected hospital casualty desk will receive this emergency alert simultaneously.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.85rem" }}
            >
              Edit Request Details
            </button>

            <Link
              to={`/emergency-status/${createdRequestId}`}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "0.85rem" }}
            >
              Skip to Status
            </Link>

            <button
              type="button"
              onClick={handleDispatchSelected}
              disabled={selectedHospitalIds.length === 0 || isDispatching}
              className="btn btn-emergency btn-md"
              style={{
                padding: "0.75rem 1.75rem",
                fontSize: "1rem",
                fontWeight: 800,
                opacity: selectedHospitalIds.length === 0 || isDispatching ? 0.6 : 1,
                cursor: selectedHospitalIds.length === 0 || isDispatching ? "not-allowed" : "pointer"
              }}
              id="contact-selected-hospitals"
            >
              {isDispatching ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Contacting selected hospitals...</span>
                </>
              ) : (
                <>
                  <span>Contact Selected Hospitals ({selectedHospitalIds.length})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "3rem 0 5rem", backgroundColor: "var(--bg-page)" }}>
      <div className="container-narrow">
        {/* Step Indicator Header */}
        <nav className="stepper-nav" aria-label="Emergency Request Progress">
          <div className={`step-node ${step === "form" ? "active" : "completed"}`}>
            <span className="step-circle">{step === "form" ? "1" : "✓"}</span>
            <span className="step-label">1. Patient & Care Needs</span>
          </div>
          <div className={`step-connector ${step === "dispatch" ? "completed" : ""}`} />
          <div className={`step-node ${step === "dispatch" ? "active" : ""}`}>
            <span className="step-circle">2</span>
            <span className="step-label">2. Hospital Selection</span>
          </div>
          <div className="step-connector" />
          <div className="step-node">
            <span className="step-circle">3</span>
            <span className="step-label">3. Live Coordination</span>
          </div>
        </nav>

        {step === "dispatch" ? (
          renderDispatchStep()
        ) : (
          <>

        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "var(--emergency-light)",
            border: "1px solid var(--emergency-border)",
            color: "var(--emergency-red)",
            padding: "0.35rem 0.95rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "0.85rem"
          }}>
            <Siren size={16} />
            <span>CRITICAL CARE FINDER</span>
          </div>

          <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
            Emergency Care Request
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: "580px", margin: "0 auto" }}>
            Tell us what the patient needs so we can find suitable hospitals.
          </p>
        </div>

        {/* Quick Triage Presets */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.75rem" }}>
            <Zap size={16} color="var(--brand-blue)" />
            <span>Fast-Track Presets (Auto-fill requirements):</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => applyPreset("cardiac")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", borderColor: "#bae6fd" }}
            >
              ❤️ Cardiac Emergency
            </button>
            <button
              type="button"
              onClick={() => applyPreset("trauma")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", borderColor: "#bae6fd" }}
            >
              🩹 Accident / Trauma
            </button>
            <button
              type="button"
              onClick={() => applyPreset("stroke")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", borderColor: "#bae6fd" }}
            >
              🧠 Stroke / Brain Emergency
            </button>
            <button
              type="button"
              onClick={() => applyPreset("breathing")}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", borderColor: "#bae6fd" }}
            >
              🫁 Breathing & Respiratory
            </button>
          </div>
        </div>

        {/* Multi-Section Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          {/* Section 1: Patient Information */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-blue-subtle)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", color: "var(--brand-navy)" }}>1. Patient Information</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Basic patient demographics for emergency triage</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
              {/* Patient Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="patient-name" className="form-label">
                  Patient Name <span style={{ color: "var(--emergency-red)" }}>*</span>
                </label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="form-input"
                  style={{ borderColor: validationErrors.patientName ? "var(--emergency-red)" : undefined }}
                  required
                />
                {validationErrors.patientName && (
                  <p style={{ color: "var(--emergency-red)", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                    {validationErrors.patientName}
                  </p>
                )}
              </div>

              {/* Patient Age */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="patient-age" className="form-label">
                  Patient Age <span style={{ color: "var(--emergency-red)" }}>*</span>
                </label>
                <input
                  id="patient-age"
                  type="number"
                  placeholder="e.g. 52"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="form-input"
                  style={{ borderColor: validationErrors.age ? "var(--emergency-red)" : undefined }}
                  required
                />
                {validationErrors.age && (
                  <p style={{ color: "var(--emergency-red)", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                    {validationErrors.age}
                  </p>
                )}
              </div>

              {/* Patient Gender */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="patient-gender" className="form-label">
                  Patient Gender <span style={{ color: "var(--emergency-red)" }}>*</span>
                </label>
                <select
                  id="patient-gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.gender && (
                  <p style={{ color: "var(--emergency-red)", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                    {validationErrors.gender}
                  </p>
                )}
              </div>

              {/* Emergency Type */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="emergency-type" className="form-label">
                  Emergency Type <span style={{ color: "var(--emergency-red)" }}>*</span>
                </label>
                <select
                  id="emergency-type"
                  value={formData.emergencyType}
                  onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                  className="form-select"
                  required
                >
                  {EMERGENCY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency Contact Phone */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="contact-phone" className="form-label">
                  Callback Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="e.g. +91 98230 12345"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Required Facilities */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-blue-subtle)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bed size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", color: "var(--brand-navy)" }}>2. Required Facilities</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Select all facilities the patient will urgently need</span>
              </div>
            </div>

            {validationErrors.facilities && (
              <div style={{ color: "var(--emergency-red)", background: "var(--emergency-light)", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {validationErrors.facilities}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.85rem" }}>
              {FACILITY_OPTIONS.map((facility) => {
                const isSelected = formData.facilities.includes(facility.id);
                return (
                  <label
                    key={facility.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${isSelected ? "var(--brand-blue)" : "var(--border-light)"}`,
                      backgroundColor: isSelected ? "var(--brand-blue-subtle)" : "var(--bg-surface)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFacility(facility.id)}
                      style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--brand-blue)" }}
                      id={`facility-chk-${facility.id.replace(/\s+/g, "-")}`}
                    />
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--brand-navy)", display: "block" }}>
                        {facility.label}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.3, display: "block" }}>
                        {facility.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: What is the main problem? (Symptom-Based Specialist Suggestion) */}
          <div className="card" style={{ padding: "1.75rem" }} id="section-specialist-suggestion">
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-blue-subtle)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stethoscope size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", color: "var(--brand-navy)" }}>3. What is the main problem?</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Help us identify the appropriate specialist for care navigation (Non-diagnostic guidance)
                </span>
              </div>
            </div>

            {/* Complaint selection options */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.75rem" }}>
                Select Patient Complaint / Primary Symptom:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                {COMPLAINT_CATEGORIES.map((complaint) => {
                  const isSelected = formData.reportedComplaint === complaint.label;
                  return (
                    <label
                      key={complaint.id}
                      id={`complaint-opt-${complaint.id}`}
                      onClick={() => handleSelectComplaint(complaint)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        padding: "0.85rem 1rem",
                        borderRadius: "var(--radius-md)",
                        border: `1.5px solid ${isSelected ? "var(--brand-blue)" : "var(--border-light)"}`,
                        backgroundColor: isSelected ? "var(--brand-blue-subtle)" : "var(--bg-surface)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <input
                        type="radio"
                        name="complaintCategory"
                        checked={isSelected}
                        onChange={() => handleSelectComplaint(complaint)}
                        style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--brand-blue)" }}
                        id={`complaint-radio-${complaint.id}`}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: isSelected ? "var(--brand-blue-hover)" : "var(--brand-navy)", lineHeight: 1.3 }}>
                          {complaint.label}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>
                          {complaint.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SUGGESTION UI BOX */}
            {formData.reportedComplaint && (
              <div
                id="suggested-specialist-box"
                style={{
                  backgroundColor: "#f0f9ff",
                  border: "1.5px solid #bae6fd",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem 1.5rem",
                  marginBottom: "1.25rem",
                  boxShadow: "0 2px 8px rgba(2, 132, 199, 0.06)"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "var(--brand-blue)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem"
                    }}>
                      <Sparkles size={13} />
                      Suggested Specialist
                    </span>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-navy)", marginTop: "0.2rem" }}>
                      {formData.suggestedSpecialist || "None (General Emergency)"}
                    </div>
                  </div>

                  {/* Active Selection Badge */}
                  <div style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: formData.specialist && formData.specialist !== "No specific specialist" ? "var(--status-available-bg)" : "#e2e8f0",
                    color: formData.specialist && formData.specialist !== "No specific specialist" ? "var(--status-available)" : "#475569",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    border: `1px solid ${formData.specialist && formData.specialist !== "No specific specialist" ? "var(--status-available-border)" : "#cbd5e1"}`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem"
                  }}>
                    <CheckCircle2 size={14} />
                    <span>
                      {formData.specialist && formData.specialist !== "No specific specialist"
                        ? `Active Requirement: ${formData.specialist}`
                        : "No specific specialist required"}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "0.88rem", color: "#334155", marginBottom: "1rem", lineHeight: 1.45 }}>
                  {formData.suggestedSpecialist
                    ? "Based on the problem you selected, CareLink suggests this specialty for care navigation."
                    : "Based on 'Other / Not sure', CareLink will not force a specialist requirement. You can continue with general casualty care or choose a specialist manually."}
                </p>

                {/* Primary Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {formData.suggestedSpecialist && (
                    <button
                      type="button"
                      id="btn-use-suggested-specialist"
                      onClick={() => handleUseSuggestedSpecialist(formData.suggestedSpecialist)}
                      className="btn btn-primary"
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        padding: "0.55rem 1.25rem",
                        gap: "0.45rem",
                        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)"
                      }}
                    >
                      <Check size={16} strokeWidth={3} />
                      <span>Use {formData.suggestedSpecialist}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="btn-change-specialist"
                    onClick={handleChangeSpecialistClick}
                    className="btn btn-outline"
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.55rem 1.25rem",
                      borderColor: "#0284c7",
                      color: "#0284c7",
                      fontWeight: 600
                    }}
                  >
                    <span>{showManualSelector ? "Hide Manual Selector" : "Change Specialist"}</span>
                  </button>

                  {!formData.suggestedSpecialist && (
                    <button
                      type="button"
                      onClick={() => handleUseSuggestedSpecialist("No specific specialist")}
                      className="btn btn-primary"
                      style={{ fontSize: "0.9rem", padding: "0.55rem 1.25rem" }}
                    >
                      <span>Continue Without Specialist</span>
                    </button>
                  )}
                </div>

                {/* Manual Specialist Dropdown Selector */}
                {showManualSelector && (
                  <div
                    id="manual-specialist-container"
                    style={{
                      marginTop: "1rem",
                      marginBottom: "1rem",
                      padding: "1rem 1.25rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-xs)"
                    }}
                  >
                    <label htmlFor="manual-specialist-select" className="form-label" style={{ fontWeight: 700, color: "var(--brand-navy)" }}>
                      Choose Specialist Manually (Overrides Suggestion)
                    </label>
                    <select
                      id="manual-specialist-select"
                      value={formData.specialist}
                      onChange={(e) => handleManualSpecialistChange(e.target.value)}
                      className="form-select"
                      style={{ fontSize: "0.92rem", fontWeight: 600 }}
                    >
                      {MANUAL_SPECIALIST_OPTIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    <p className="form-hint" style={{ marginTop: "0.4rem" }}>
                      Selecting a specialty here directly sets your hospital matching requirement to this specialist.
                    </p>
                  </div>
                )}

                {/* Concise Non-Diagnostic Safety Disclaimer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fef3c7",
                    fontSize: "0.8rem",
                    color: "#92400e",
                    lineHeight: 1.4
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Care Navigation Notice:</strong> {SPECIALIST_DISCLAIMER}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Budget & Insurance */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-blue-subtle)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.2rem", color: "var(--brand-navy)" }}>4. Budget & Insurance</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Target daily admission budget and insurance scheme</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
              {/* Budget Range */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="budget-select" className="form-label">
                  Estimated Daily Budget
                </label>
                <select
                  id="budget-select"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="form-select"
                >
                  {BUDGET_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label}
                    </option>
                  ))}
                </select>
                <p className="form-hint">Includes estimated bed + critical nursing daily rate</p>
              </div>

              {/* Insurance */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="insurance-select" className="form-label">
                  Insurance / Scheme
                </label>
                <select
                  id="insurance-select"
                  value={formData.insurance}
                  onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  className="form-select"
                >
                  {INSURANCE_OPTIONS.map((ins) => (
                    <option key={ins} value={ins}>
                      {ins}
                    </option>
                  ))}
                </select>
                <p className="form-hint">Matches hospitals supporting cashless or scheme empanelment</p>
              </div>
            </div>
          </div>

          {/* Section 5: Location */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-blue-subtle)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.2rem", color: "var(--brand-navy)" }}>5. Patient Location (Optional)</h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Share current GPS location or enter address to assist hospital dispatch and ETA</span>
                </div>
              </div>
              {patientLocation.hasLocation && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: "0.75rem", color: "#64748b", padding: "0.2rem 0.5rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  title="Clear selected location"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Privacy & Scope Notice */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "0.65rem 0.85rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1rem",
              fontSize: "0.8rem",
              color: "#166534"
            }}>
              <Shield size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#16a34a" }} />
              <div>
                <strong>Privacy Protected:</strong> Location is requested only after clicking "Use My Current Location". Coordinates are shared exclusively with the responding hospital for emergency dispatch and ETA calculation. Continuous tracking is never performed.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={patientLocation.address || ""}
                  onChange={(e) => handleManualAddressChange(e.target.value)}
                  placeholder="Enter manual area or city (e.g. Shivajinagar, Pune or Mumbai)"
                  className="form-input"
                  style={{ flex: "1 1 240px" }}
                  id="patient-location-input"
                />
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className="btn btn-outline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontWeight: 600,
                    borderColor: isLocating ? "var(--border-medium)" : "var(--brand-blue)",
                    color: "var(--brand-blue)"
                  }}
                  id="use-my-location-btn"
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={16} className="spin" color="var(--brand-blue)" />
                      <span>Retrieving GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} color="var(--brand-blue)" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Loading indicator */}
              {isLocating && (
                <div style={{ fontSize: "0.82rem", color: "var(--brand-blue)", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0" }}>
                  <Loader2 size={14} className="spin" />
                  <span>Requesting browser location permission and satellite coordinates...</span>
                </div>
              )}

              {/* Error indicator */}
              {locationError && (
                <div style={{
                  fontSize: "0.82rem",
                  color: "#b91c1c",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "0.55rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Success indicator */}
              {locationSuccessMsg && !locationError && (
                <div style={{
                  fontSize: "0.82rem",
                  color: "#15803d",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  padding: "0.55rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}>
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>{locationSuccessMsg}</span>
                </div>
              )}

              {/* Map Preview when coordinates exist */}
              {patientLocation.hasCoordinates && patientLocation.latitude !== null && patientLocation.longitude !== null && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--brand-navy)" }}>
                      Live Map Preview & Patient Coordinates:
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      OpenStreetMap Tiles • Leaflet
                    </span>
                  </div>
                  <PatientLocationMap
                    latitude={patientLocation.latitude}
                    longitude={patientLocation.longitude}
                    address={patientLocation.address}
                    source="gps"
                    height="220px"
                    showDirectionsButton={false}
                  />
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    fontSize: "0.8rem"
                  }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Selected Coordinates: </span>
                      <strong style={{ color: "var(--brand-navy)" }}>
                        {formatCoordinates(patientLocation.latitude, patientLocation.longitude)}
                      </strong>
                    </div>
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      ✓ Coordinates ready for emergency triage review
                    </span>
                  </div>
                </div>
              )}

              <p className="form-hint">
                Enter your area or city (e.g. <strong>Mumbai</strong> or <strong>Pune</strong>) or click <strong>Use My Current Location</strong> to detect GPS coordinates. Submission is not blocked if location is unavailable.
              </p>
            </div>
          </div>

          {/* Safety Disclaimer Reminder */}
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            fontSize: "0.82rem",
            color: "#92400e",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem"
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Emergency Care Note:</strong> Submitting this request queries hospital-reported readiness. Always telephone the casualty desk before departure to reserve critical admission.
            </div>
          </div>

          {/* Feedback & Submission State Banner */}
          {submitFeedback && (
            <div
              style={{
                backgroundColor: submitFeedback.type === "success" ? "#ecfdf5" : "#fffbeb",
                border: `1.5px solid ${submitFeedback.type === "success" ? "#a7f3d0" : "#fef3c7"}`,
                borderRadius: "var(--radius-md)",
                padding: "1.1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                color: submitFeedback.type === "success" ? "#065f46" : "#92400e",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                animation: "fadeIn 0.3s ease-in-out"
              }}
              role="alert"
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                {submitFeedback.type === "success" ? (
                  <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                ) : (
                  <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                )}
                <div>
                  <strong style={{ display: "block", marginBottom: "0.15rem", fontSize: "0.95rem" }}>
                    {submitFeedback.type === "success" ? "Emergency Triage Dispatched" : "Offline Notice"}
                  </strong>
                  <span>{submitFeedback.message}</span>
                </div>
              </div>

              {submitFeedback.requestId && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", paddingLeft: "2.1rem" }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/emergency-status/${submitFeedback.requestId}`)}
                    className="btn btn-primary btn-sm"
                    style={{
                      backgroundColor: "#059669",
                      borderColor: "#059669",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "var(--shadow-sm)"
                    }}
                    id="track-emergency-request-btn"
                  >
                    <Activity size={15} />
                    <span>Track Emergency Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/hospitals", {
                        state: {
                          fromEmergencyForm: true,
                          submittedRequestId: submitFeedback.requestId,
                          requestStatus: "PENDING"
                        }
                      })
                    }
                    className="btn btn-outline btn-sm"
                    style={{ color: "#065f46", borderColor: "#a7f3d0", fontWeight: 600 }}
                  >
                    <span>View Matching Hospitals</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Creation Error Banner */}
          {creationError && (
            <div
              id="creation-error-banner"
              style={{
                backgroundColor: "#fef2f2",
                border: "1.5px solid #fecaca",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                color: "#991b1b",
                fontSize: "0.92rem",
                lineHeight: 1.5,
                animation: "fadeIn 0.3s ease-in-out"
              }}
              role="alert"
            >
              <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", marginBottom: "0.2rem", fontSize: "0.95rem", color: "#7f1d1d" }}>
                  Emergency Request Registration Failed
                </strong>
                <div>{creationError}</div>
                <div style={{ fontSize: "0.82rem", color: "#b91c1c", marginTop: "0.35rem" }}>
                  Please check your connection and click <strong>Find Matching Hospitals</strong> below to retry.
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-emergency btn-lg"
              style={{
                width: "100%",
                maxWidth: "460px",
                padding: "1.1rem 2rem",
                fontSize: "1.15rem",
                fontWeight: 800,
                letterSpacing: "0.01em",
                opacity: isSubmitting ? 0.75 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
              id="submit-emergency-request"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="spin" />
                  <span>Registering Emergency Request...</span>
                </>
              ) : (
                <>
                  <span>Find Matching Hospitals</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
        </>
      )}
      </div>
    </div>
  );
}
