/**
 * CareLink Emergency - Specialist Suggestions Utility
 *
 * DISCLAIMER & REGULATORY NOTICE:
 * This utility is strictly for CARE NAVIGATION and operational routing.
 * It is NOT a medical diagnosis system.
 * It does NOT diagnose diseases, evaluate medical probability, or prescribe treatments.
 * It helps patients identify relevant clinical specialties based on their reported symptoms.
 */

export const SPECIALIST_DISCLAIMER =
  "Specialist suggestions are for care navigation only and are not a medical diagnosis. If symptoms are severe or life-threatening, seek emergency medical care immediately.";

export const COMPLAINT_CATEGORIES = [
  {
    id: "chest-pain",
    label: "Chest pain / heart-related symptoms",
    suggestedSpecialist: "Cardiologist",
    description: "Acute chest pressure, palpitations, suspected cardiac distress"
  },
  {
    id: "neurological",
    label: "Severe headache / seizure / weakness / numbness",
    suggestedSpecialist: "Neurologist",
    description: "Sudden facial or limb numbness, intense headache, seizure, motor loss"
  },
  {
    id: "breathing",
    label: "Breathing difficulty",
    suggestedSpecialist: "Pulmonologist",
    description: "Severe shortness of breath, asthma exacerbation, respiratory distress"
  },
  {
    id: "abdominal",
    label: "Severe abdominal / digestive problem",
    suggestedSpecialist: "Gastroenterologist",
    description: "Acute abdominal pain, continuous vomiting, gastrointestinal bleeding"
  },
  {
    id: "musculoskeletal",
    label: "Bone / joint injury or severe musculoskeletal problem",
    suggestedSpecialist: "Orthopedic",
    description: "Fractures, joint dislocation, traumatic musculoskeletal injury"
  },
  {
    id: "kidney-urinary",
    label: "Kidney / urinary problem",
    suggestedSpecialist: "Nephrologist / Urologist",
    description: "Acute renal complication, severe flank pain, urinary blockage"
  },
  {
    id: "skin",
    label: "Skin-related problem",
    suggestedSpecialist: "Dermatologist",
    description: "Severe acute allergic rash, extensive burns, severe skin lesions"
  },
  {
    id: "child-emergency",
    label: "Child emergency",
    suggestedSpecialist: "Pediatrician",
    description: "Infant and pediatric acute illness, high fever, pediatric distress"
  },
  {
    id: "other",
    label: "Other / Not sure",
    suggestedSpecialist: null,
    description: "Unlisted acute concern, generalized malaise, or uncertain specialty"
  }
];

export const MANUAL_SPECIALIST_OPTIONS = [
  "No specific specialist",
  "Cardiologist",
  "Neurologist",
  "Pulmonologist",
  "Gastroenterologist",
  "Orthopedic",
  "Nephrologist",
  "Urologist",
  "Dermatologist",
  "Pediatrician",
  "General Physician",
  "Other"
];

/**
 * Find suggested specialist by complaint ID or label.
 * @param {string} idOrLabel
 * @returns {string|null}
 */
export function getSuggestedSpecialist(idOrLabel) {
  if (!idOrLabel) return null;
  const q = idOrLabel.trim().toLowerCase();
  const match = COMPLAINT_CATEGORIES.find(
    (c) => c.id.toLowerCase() === q || c.label.toLowerCase() === q || c.label.toLowerCase().includes(q)
  );
  return match ? match.suggestedSpecialist : null;
}

/**
 * Get suggestions for an array of complaint IDs or labels.
 * Returns an array of unique suggested specialties.
 * @param {string[]} complaintList
 * @returns {string[]}
 */
export function getSuggestionsForComplaints(complaintList = []) {
  const suggestions = new Set();
  for (const item of complaintList) {
    const spec = getSuggestedSpecialist(item);
    if (spec) {
      suggestions.add(spec);
    }
  }
  return Array.from(suggestions);
}
