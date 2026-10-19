import { HOSPITALS } from "../data/hospitals.js";
import { matchesLocation } from "./matching.js";

const FACILITY_METADATA = {
  emergency: { name: "Emergency / Trauma Care", defaultDesc: "24/7 dedicated trauma resuscitation bay" },
  icu: { name: "ICU", defaultDesc: "Advanced Level-3 Intensive Care Unit" },
  ventilator: { name: "Ventilator", defaultDesc: "Invasive & Non-invasive mechanical ventilation" },
  operationTheatre: { name: "Operation Theatre", defaultDesc: "Laminar airflow emergency surgical suites" },
  bloodBank: { name: "Blood Bank", defaultDesc: "Licensed blood and component storage" },
  ctScan: { name: "CT Scan", defaultDesc: "Rapid spiral diagnostic CT imaging" },
  mri: { name: "MRI", defaultDesc: "High-resolution digital MRI scanner" },
  pharmacy: { name: "Pharmacy", defaultDesc: "24/7 in-house emergency casualty dispensary" },
  ambulance: { name: "Ambulance", defaultDesc: "Advanced Cardiac Life Support (ACLS) fleet" },
  dialysis: { name: "Dialysis", defaultDesc: "Acute emergency hemodialysis stations" },
  nicu: { name: "NICU", defaultDesc: "Neonatal intensive care nursery" },
  picu: { name: "PICU", defaultDesc: "Pediatric intensive care unit" }
};

/**
 * Finds a matching demo hospital reference by ID, slug, or name
 */
export function findDemoHospital(idOrName, demoList = HOSPITALS) {
  if (!idOrName) return null;
  const target = String(idOrName).toLowerCase().trim();

  return (
    demoList.find((h) => {
      if (h.id && h.id.toLowerCase() === target) return true;
      if (h._id && String(h._id).toLowerCase() === target) return true;
      if (h.name && h.name.toLowerCase() === target) return true;
      if (h.name && target.includes(h.name.toLowerCase())) return true;
      if (h.name && h.name.toLowerCase().includes(target)) return true;
      return false;
    }) || null
  );
}

/**
 * Maps a single backend hospital document into the frontend schema expected by:
 * - matching.js
 * - HospitalCard.jsx
 * - HospitalDetails.jsx
 */
export function mapBackendHospital(backendHosp, demoList = HOSPITALS) {
  if (!backendHosp) return null;

  const demoMatch = findDemoHospital(backendHosp.name || backendHosp.id, demoList);
  const avail = backendHosp.availability || {};

  // Normalize bed counts
  const normalAvail = avail.normalBeds?.available ?? demoMatch?.generalBeds?.available ?? 20;
  const normalTotal = avail.normalBeds?.total ?? demoMatch?.generalBeds?.total ?? 40;
  const icuAvail = avail.icuBeds?.available ?? demoMatch?.icuBeds?.available ?? 3;
  const icuTotal = avail.icuBeds?.total ?? demoMatch?.icuBeds?.total ?? 10;
  const ventAvail = avail.ventilators?.available ?? demoMatch?.ventilators?.available ?? 2;
  const ventTotal = avail.ventilators?.total ?? demoMatch?.ventilators?.total ?? 6;
  const emgAvail = avail.emergencyBeds?.available ?? demoMatch?.emergencyBeds?.available ?? 4;
  const emgTotal = avail.emergencyBeds?.total ?? demoMatch?.emergencyBeds?.total ?? 12;

  // Determine emergency status
  let emergencyStatus = "available";
  if (backendHosp.readinessStatus === "FULL" || (icuAvail === 0 && emgAvail === 0)) {
    emergencyStatus = "unavailable";
  } else if (backendHosp.readinessStatus === "LIMITED" || icuAvail === 0 || emgAvail <= 2) {
    emergencyStatus = "limited";
  } else if (demoMatch?.emergencyStatus) {
    emergencyStatus = demoMatch.emergencyStatus;
  }

  // Map specialists/doctors
  let mappedSpecialists = [];
  if (Array.isArray(backendHosp.doctors) && backendHosp.doctors.length > 0) {
    mappedSpecialists = backendHosp.doctors.map((d, index) => {
      const isAvailable = d.status === "ON_DUTY" || d.status === "Available" || d.status === "ON_CALL";
      let onCallLabel = "In House";
      if (d.status === "ON_CALL") onCallLabel = "On Call";
      else if (d.status === "UNAVAILABLE" || d.status === "Unavailable") onCallLabel = "Off Duty";

      return {
        id: d._id || d.id || `doc-${index + 1}`,
        _id: d._id,
        name: d.name,
        specialty: d.specialization || d.specialty || "Specialist",
        status: isAvailable ? "Available" : "Unavailable",
        onCall: onCallLabel,
        experience: d.experience || "10+ yrs",
        qualifications: d.qualification || "MD / MS",
        workingHours: d.workingHours || "8 AM – 8 PM",
        phone: d.phone || ""
      };
    });
  } else if (demoMatch?.specialists) {
    mappedSpecialists = demoMatch.specialists;
  }

  // Map facilities
  let mappedFacilities = [];
  if (backendHosp.facilities && typeof backendHosp.facilities === "object" && !Array.isArray(backendHosp.facilities)) {
    mappedFacilities = Object.entries(backendHosp.facilities).map(([key, val], idx) => {
      const meta = FACILITY_METADATA[key] || { name: key, defaultDesc: "Diagnostic & critical care service" };
      const isAvail = typeof val === "object" ? Boolean(val?.available ?? val?.status === "Available") : Boolean(val);
      const desc = (typeof val === "object" && val?.details) || meta.defaultDesc;
      return {
        id: `fac-${idx + 1}`,
        name: meta.name,
        available: isAvail,
        description: desc
      };
    });
  } else if (Array.isArray(backendHosp.facilities) && backendHosp.facilities.length > 0) {
    mappedFacilities = backendHosp.facilities;
  } else if (demoMatch?.facilities) {
    mappedFacilities = demoMatch.facilities;
  }

  // Map costs
  let mappedCost = demoMatch?.estimatedCost || {
    budgetTier: "₹5,000–₹10,000/day",
    generalBed: "₹3,500/day",
    icu: "₹8,500/day",
    consultation: "₹800",
    emergencyConsultation: "₹1,200",
    dailyRange: "₹7,000–₹10,000/day"
  };

  if (backendHosp.costs) {
    const c = backendHosp.costs;
    const icuRate = Number(c.icuPerDay) || 8500;
    let budgetTier = "₹5,000–₹10,000/day";
    if (icuRate > 15000) budgetTier = "₹20,000+/day";
    else if (icuRate > 8000) budgetTier = "₹10,000–₹20,000/day";
    else if (icuRate <= 5000) budgetTier = "₹0–₹5,000/day";

    mappedCost = {
      budgetTier,
      generalBed: c.normalBedPerDay ? `₹${Number(c.normalBedPerDay).toLocaleString()}/day` : mappedCost.generalBed,
      icu: c.icuPerDay ? `₹${Number(c.icuPerDay).toLocaleString()}/day` : mappedCost.icu,
      consultation: c.consultation ? `₹${Number(c.consultation).toLocaleString()}` : mappedCost.consultation,
      emergencyConsultation: c.emergencyVisit ? `₹${Number(c.emergencyVisit).toLocaleString()}` : mappedCost.emergencyConsultation,
      dailyRange:
        c.minEstimatedCost && c.maxEstimatedCost
          ? `₹${Number(c.minEstimatedCost).toLocaleString()}–₹${Number(c.maxEstimatedCost).toLocaleString()}/day`
          : mappedCost.dailyRange
    };
  }

  // Map insurance
  const mappedInsurance =
    backendHosp.costs?.insuranceAccepted && backendHosp.costs.insuranceAccepted.length > 0
      ? backendHosp.costs.insuranceAccepted
      : demoMatch?.insurance || ["Private Insurance", "Cashless Insurance", "Ayushman Bharat"];

  const otActive =
    avail.otSuitesAvailable !== undefined ? Number(avail.otSuitesAvailable) : demoMatch?.operationTheatre?.activeTheatres ?? 2;
  const bloodAvail =
    avail.bloodBankAvailable !== undefined ? Boolean(avail.bloodBankAvailable) : demoMatch?.bloodBank?.available ?? true;

  const hospitalId = backendHosp._id || backendHosp.id || demoMatch?.id;

  return {
    id: hospitalId,
    _id: backendHosp._id || hospitalId,
    name: backendHosp.name,
    address: backendHosp.address || demoMatch?.address || "Maharashtra",
    city: backendHosp.city
      ? backendHosp.city.includes("Maharashtra")
        ? backendHosp.city
        : `${backendHosp.city}, Maharashtra`
      : demoMatch?.city || (backendHosp.address?.toLowerCase().includes("mumbai") ? "Mumbai, Maharashtra" : "Pune, Maharashtra"),
    distance: demoMatch?.distance ?? 3.5,
    distanceText: demoMatch?.distanceText ?? "3.5 km",
    eta: demoMatch?.eta ?? 10,
    etaText: demoMatch?.etaText ?? "10 min",
    emergencyStatus,
    generalBeds: {
      available: normalAvail,
      total: normalTotal
    },
    icuBeds: {
      available: icuAvail,
      total: icuTotal
    },
    ventilators: {
      available: ventAvail,
      total: ventTotal
    },
    emergencyBeds: {
      available: emgAvail,
      total: emgTotal
    },
    operationTheatre: {
      available: otActive > 0,
      activeTheatres: otActive,
      total: demoMatch?.operationTheatre?.total ?? 4
    },
    bloodBank: {
      available: bloodAvail,
      inStockGroups: demoMatch?.bloodBank?.inStockGroups || ["A+", "B+", "O+", "AB+"]
    },
    specialists: mappedSpecialists,
    facilities: mappedFacilities,
    insurance: mappedInsurance,
    estimatedCost: mappedCost,
    lastVerified: avail.lastVerified || backendHosp.lastVerified || "Just now",
    lastVerifiedMinutes: 0,
    phone: backendHosp.phone || demoMatch?.phone || "+91 20 2567 8900",
    emergencyHelpline: backendHosp.emergencyPhone || demoMatch?.emergencyHelpline || "+91 20 2567 8999",
    ambulanceContact: demoMatch?.ambulanceContact || "+91 20 2567 8911",
    description: backendHosp.description || demoMatch?.description || "",
    coordinates: backendHosp.latitude
      ? { lat: backendHosp.latitude, lng: backendHosp.longitude }
      : demoMatch?.coordinates || { lat: 18.5314, lng: 73.8344 },
    isLiveBackend: true
  };
}

/**
 * Maps a list of backend hospital objects, retaining additional demo hospitals
 * so search depth is maintained while prioritizing live backend records.
 * If locationFilter is provided, demo additions and fallback are strictly restricted
 * to matching that location.
 */
export function mapBackendHospitalsList(backendList = null, demoList = HOSPITALS, locationFilter = null) {
  // If backend is unavailable or not provided, return demo data filtered by location
  if (backendList === null || backendList === undefined) {
    const list = locationFilter
      ? demoList.filter((dh) => matchesLocation(dh, locationFilter))
      : demoList;
    return list.map((h) => ({ ...h, isLiveBackend: false }));
  }

  if (!Array.isArray(backendList)) {
    return [];
  }

  const liveMapped = backendList
    .map((bh) => mapBackendHospital(bh, demoList))
    .filter((h) => !locationFilter || matchesLocation(h, locationFilter));
  const liveNames = new Set(liveMapped.map((h) => h.name.toLowerCase().trim()));

  // Only consider demo hospitals that match the requested location
  const matchingDemo = locationFilter
    ? demoList.filter((dh) => matchesLocation(dh, locationFilter))
    : demoList;

  // Append remaining demo hospitals that are not registered in the backend yet
  const remainingDemo = matchingDemo
    .filter((dh) => !liveNames.has(dh.name.toLowerCase().trim()))
    .map((dh) => ({ ...dh, isLiveBackend: false }));

  return [...liveMapped, ...remainingDemo];
}
