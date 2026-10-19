/**
 * CareLink Emergency - Matching Engine
 *
 * Computes requirement matching between patient needs and hospital-reported capabilities.
 * NOTE: This is NOT a medical recommendation or diagnosis tool.
 * It objectively checks user-specified requirements against reported hospital data.
 */

function isDoctorAvailable(status) {
  if (!status) return false;
  const s = String(status).trim().toLowerCase();
  return s === "available" || s === "on_duty" || s === "on duty" || s === "on_call" || s === "on call";
}

export function matchesSpecialty(docSpecialty, targetSpecialty) {
  if (!docSpecialty || !targetSpecialty) return false;
  const d = String(docSpecialty).trim().toLowerCase();
  const t = String(targetSpecialty).trim().toLowerCase();
  if (d === t) return true;

  // Split slash alternatives (e.g. "Nephrologist / Urologist")
  const tTokens = t.split("/").map((tok) => tok.trim());
  const dTokens = d.split("/").map((tok) => tok.trim());

  for (const tToken of tTokens) {
    for (const dToken of dTokens) {
      if (dToken === tToken) return true;
      // "Orthopedic" matches "Orthopedic Surgeon"
      if (tToken === "orthopedic" && dToken.includes("orthopedic")) return true;
      if (dToken === "orthopedic" && tToken.includes("orthopedic")) return true;
      // "General Physician" matches "Physician" or "General Medicine"
      if (
        (tToken === "general physician" || tToken === "physician") &&
        (dToken.includes("physician") || dToken.includes("medicine"))
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Objective specialist matcher.
 * Performs exact case-insensitive match on requested specialty,
 * handling slash alternatives and doctor status variations.
 * Returns { matchedSpecialist, isAvailable }
 */
export function findSpecialistMatch(specialists = [], targetSpecialty) {
  if (!targetSpecialty || typeof targetSpecialty !== "string") {
    return { matchedSpecialist: null, isAvailable: false };
  }

  const query = targetSpecialty.trim().toLowerCase();
  if (!query || query === "no specific specialist" || query === "other" || query === "none") {
    return { matchedSpecialist: null, isAvailable: false };
  }

  // 1. Look for an available doctor of this exact specialty
  const availableDoc = specialists.find((s) => {
    const spec = (s.specialty || s.specialization || "").trim();
    const isAvail = isDoctorAvailable(s.status);
    return matchesSpecialty(spec, query) && isAvail;
  });

  if (availableDoc) {
    return { matchedSpecialist: availableDoc, isAvailable: true };
  }

  // 2. Otherwise look for any doctor of this specialty on the roster (e.g. Off Duty / Unavailable)
  const rosterDoc = specialists.find((s) => {
    const spec = (s.specialty || s.specialization || "").trim();
    return matchesSpecialty(spec, query);
  });

  return { matchedSpecialist: rosterDoc || null, isAvailable: false };
}

export function matchHospital(hospital, requirements = {}) {
  const {
    facilities = [],
    specialist = "No specific specialist",
    budget = "any",
    insurance = "No insurance"
  } = requirements;

  const checks = [];

  // 1. Check required facilities
  facilities.forEach(facility => {
    let matched = false;
    let detail = "";

    switch (facility) {
      case "ICU":
        matched = hospital.icuBeds && hospital.icuBeds.available > 0;
        detail = matched ? `${hospital.icuBeds.available} ICU beds open` : "0 ICU beds available";
        break;
      case "Ventilator":
        matched = hospital.ventilators && hospital.ventilators.available > 0;
        detail = matched ? `${hospital.ventilators.available} ventilators open` : "0 ventilators available";
        break;
      case "General Bed":
        matched = hospital.generalBeds && hospital.generalBeds.available > 0;
        detail = matched ? `${hospital.generalBeds.available} general beds open` : "General ward full";
        break;
      case "Emergency / Trauma Care":
        matched = hospital.emergencyStatus !== "unavailable" &&
          hospital.facilities.some(f => f.name.includes("Emergency") && f.available);
        detail = matched ? "Active trauma bay" : "Emergency triage overwhelmed";
        break;
      case "Operation Theatre":
        matched = Boolean(hospital.operationTheatre?.available && hospital.operationTheatre?.activeTheatres > 0);
        detail = matched ? `${hospital.operationTheatre.activeTheatres} active OTs` : "OTs currently booked";
        break;
      case "Blood Bank":
        matched = Boolean(hospital.bloodBank?.available);
        detail = matched ? "Blood bank in-house" : "External blood sourcing only";
        break;
      default: {
        const found = hospital.facilities.find(f => f.name.toLowerCase() === facility.toLowerCase());
        matched = Boolean(found && found.available);
        detail = matched ? "Facility reported available" : "Facility unavailable";
      }
    }

    checks.push({
      name: facility,
      matched,
      detail
    });
  });

  // 2. Check Specialist
  let targetSpecialist = null;
  let matchedSpecialist = null;
  let isSpecialistMatched = null;

  const trimmedSpecialist = (specialist || "").trim();
  const lowerSpecialist = trimmedSpecialist.toLowerCase();

  if (trimmedSpecialist && lowerSpecialist !== "no specific specialist" && lowerSpecialist !== "other") {
    targetSpecialist = trimmedSpecialist;
    const match = findSpecialistMatch(hospital.specialists || [], trimmedSpecialist);
    matchedSpecialist = match.matchedSpecialist;
    isSpecialistMatched = match.isAvailable;

    checks.push({
      name: `${trimmedSpecialist}`,
      matched: match.isAvailable,
      detail: match.isAvailable
        ? `${match.matchedSpecialist.name} (${match.matchedSpecialist.onCall || "In House"})`
        : (match.matchedSpecialist ? `${match.matchedSpecialist.name} (${match.matchedSpecialist.status || "Unavailable"})` : "Specialist not on duty")
    });
  }

  // 3. Check Budget Tier
  if (budget && budget !== "any") {
    const matched = hospital.estimatedCost?.budgetTier === budget ||
      (budget === "₹0–₹5,000/day" && hospital.estimatedCost?.budgetTier === "₹0–₹5,000/day") ||
      (budget === "₹5,000–₹10,000/day" && (hospital.estimatedCost?.budgetTier === "₹5,000–₹10,000/day" || hospital.estimatedCost?.budgetTier === "₹0–₹5,000/day")) ||
      (budget === "₹10,000–₹20,000/day" && hospital.estimatedCost?.budgetTier !== "₹20,000+/day");

    checks.push({
      name: `Budget (${budget})`,
      matched,
      detail: matched ? `Estimated ${hospital.estimatedCost.budgetTier}` : `Estimated ${hospital.estimatedCost.budgetTier}`
    });
  }

  // 4. Check Insurance
  if (insurance && insurance !== "No insurance" && insurance !== "Other") {
    const matched = hospital.insurance?.includes(insurance);
    checks.push({
      name: insurance,
      matched: Boolean(matched),
      detail: matched ? "Accepted" : "Not listed in accepted schemes"
    });
  }

  const matchedCriteria = checks.filter(c => c.matched);
  const missingCriteria = checks.filter(c => !c.matched);
  const total = checks.length;
  const matchCount = matchedCriteria.length;
  const isExactMatch = total === 0 || matchCount === total;
  const matchRatio = total > 0 ? matchCount / total : 1;

  // Compute composite sorting score (higher is better)
  let score = matchRatio * 100;
  if (hospital.emergencyStatus === "available") score += 15;
  if (hospital.emergencyStatus === "limited") score += 5;
  // Penalty for long distance
  score -= Math.min(hospital.distance * 1.5, 20);
  // Freshness boost
  if (hospital.lastVerifiedMinutes <= 5) score += 10;
  else if (hospital.lastVerifiedMinutes <= 15) score += 5;

  return {
    hospital,
    checks,
    matchedCriteria,
    missingCriteria,
    matchCount,
    totalRequirements: total,
    isExactMatch,
    matchRatio,
    score: Math.round(score),
    label: total > 0 ? `${matchCount}/${total} requirements matched` : "General listing",
    requestedSpecialist: targetSpecialist,
    matchedSpecialist,
    isSpecialistMatched
  };
}

/**
 * Objective location matcher.
 * Treats city as a hard requirement. Case-insensitive.
 * Prevents false matches where a street address in one city mentions another city
 * (e.g. "Old Mumbai-Pune Highway" in Pune must never match a search for "Mumbai").
 */
export function matchesLocation(hospital, locationQuery) {
  let queryStr = "";
  if (typeof locationQuery === "string") {
    queryStr = locationQuery;
  } else if (locationQuery && typeof locationQuery === "object") {
    queryStr = locationQuery.city || locationQuery.address || "";
  }

  if (!queryStr || !queryStr.trim()) {
    return true;
  }

  const query = queryStr.trim().toLowerCase();
  const primaryToken = query.split(",")[0].trim().toLowerCase();
  const hCity = (hospital.city || "").trim().toLowerCase();

  // Specific city checks
  if (query.includes("mumbai") || primaryToken.includes("mumbai")) {
    return hCity.includes("mumbai");
  }
  if (query.includes("pune") || primaryToken.includes("pune")) {
    return hCity.includes("pune");
  }

  // General city match: check if hospital.city matches the requested city token
  if (hCity && (hCity === primaryToken || hCity.includes(primaryToken) || primaryToken.includes(hCity))) {
    return true;
  }

  return false;
}

/**
 * Filter and sort hospital results based on criteria and sort option
 */
export function filterAndSortHospitals(hospitals, requirements, activeFilters = {}, sortOption = "best-match") {
  // Apply location filter BEFORE other hospital matching criteria
  let filteredHospitals = hospitals;
  if (requirements && requirements.location) {
    filteredHospitals = hospitals.filter(h => matchesLocation(h, requirements.location));
  }

  // Evaluate requirement matches on location-filtered hospitals
  let results = filteredHospitals.map(h => matchHospital(h, requirements));

  // Apply quick filters if active
  if (activeFilters.icu) {
    results = results.filter(r => r.hospital.icuBeds && r.hospital.icuBeds.available > 0);
  }
  if (activeFilters.ventilator) {
    results = results.filter(r => r.hospital.ventilators && r.hospital.ventilators.available > 0);
  }
  if (activeFilters.emergencyCare) {
    results = results.filter(r => r.hospital.emergencyStatus !== "unavailable");
  }
  if (activeFilters.bloodBank) {
    results = results.filter(r => r.hospital.bloodBank?.available);
  }
  if (activeFilters.specialist && requirements.specialist && requirements.specialist !== "No specific specialist") {
    results = results.filter(r => {
      const match = findSpecialistMatch(r.hospital.specialists || [], requirements.specialist);
      return match.isAvailable;
    });
  }
  if (activeFilters.insurance && requirements.insurance && requirements.insurance !== "No insurance") {
    results = results.filter(r => r.hospital.insurance?.includes(requirements.insurance));
  }
  if (activeFilters.searchQuery && activeFilters.searchQuery.trim() !== "") {
    const q = activeFilters.searchQuery.toLowerCase();
    results = results.filter(r =>
      r.hospital.name.toLowerCase().includes(q) ||
      r.hospital.address.toLowerCase().includes(q) ||
      r.hospital.specialists?.some(s => s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q))
    );
  }

  // Sort results
  const sorted = [...results].sort((a, b) => {
    switch (sortOption) {
      case "best-match":
        // Exact matches first, then score
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        return b.score - a.score;
      case "nearest":
        return a.hospital.distance - b.hospital.distance;
      case "fastest-eta":
        return a.hospital.eta - b.hospital.eta;
      case "lowest-cost": {
        // Compare min cost
        const costA = parseInt(a.hospital.estimatedCost?.generalBed.replace(/[^\d]/g, "") || "99999", 10);
        const costB = parseInt(b.hospital.estimatedCost?.generalBed.replace(/[^\d]/g, "") || "99999", 10);
        return costA - costB;
      }
      case "recently-verified":
        return (a.hospital.lastVerifiedMinutes || 99) - (b.hospital.lastVerifiedMinutes || 99);
      default:
        return b.score - a.score;
    }
  });

  return sorted;
}
