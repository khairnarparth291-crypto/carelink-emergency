/**
 * Location Helper Utilities for CareLink Emergency
 *
 * Provides safe parsing, normalization, formatting, and direction URL generation
 * for patient locations across the patient form, emergency status, and hospital portal.
 */

/**
 * Normalizes any location input (object, legacy string, null/undefined)
 * into a structured, predictable format.
 *
 * @param {any} loc - Location data from API or form state
 * @returns {object} Normalized location info
 */
export function getLocationInfo(loc) {
  if (loc === null || loc === undefined) {
    return {
      hasLocation: false,
      hasCoordinates: false,
      latitude: null,
      longitude: null,
      address: "",
      source: null,
      displayText: "Location not provided."
    };
  }

  // Legacy string location (e.g. "Mumbai, Maharashtra" or "Pune, Shivajinagar")
  if (typeof loc === "string") {
    const trimmed = loc.trim();
    if (!trimmed) {
      return {
        hasLocation: false,
        hasCoordinates: false,
        latitude: null,
        longitude: null,
        address: "",
        source: null,
        displayText: "Location not provided."
      };
    }
    return {
      hasLocation: true,
      hasCoordinates: false,
      latitude: null,
      longitude: null,
      address: trimmed,
      source: "manual",
      displayText: trimmed
    };
  }

  // Structured location object
  if (typeof loc === "object") {
    const lat = loc.latitude !== null && loc.latitude !== undefined && loc.latitude !== ""
      ? Number(loc.latitude)
      : null;
    const lng = loc.longitude !== null && loc.longitude !== undefined && loc.longitude !== ""
      ? Number(loc.longitude)
      : null;

    const hasCoords =
      lat !== null &&
      lng !== null &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180;

    const address = typeof loc.address === "string" ? loc.address.trim() : "";
    const source = loc.source === "gps" || loc.source === "manual" ? loc.source : (hasCoords ? "gps" : "manual");

    if (!hasCoords && !address) {
      return {
        hasLocation: false,
        hasCoordinates: false,
        latitude: null,
        longitude: null,
        address: "",
        source: null,
        displayText: "Location not provided."
      };
    }

    let display = address;
    if (!display && hasCoords) {
      display = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    return {
      hasLocation: true,
      hasCoordinates: hasCoords,
      latitude: hasCoords ? lat : null,
      longitude: hasCoords ? lng : null,
      address,
      source,
      displayText: display || "Location not provided."
    };
  }

  return {
    hasLocation: false,
    hasCoordinates: false,
    latitude: null,
    longitude: null,
    address: "",
    source: null,
    displayText: "Location not provided."
  };
}

/**
 * Formats coordinates for human-readable display (e.g. "18.5204° N, 73.8567° E")
 */
export function formatCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return "";
  }
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

/**
 * Builds a Google Maps Directions URL from either coordinates or address.
 * If coordinates exist, uses destination=lat,lng.
 * If only an address exists, uses destination=address.
 * If neither exists, returns null.
 */
export function getDirectionsUrl(loc) {
  const info = getLocationInfo(loc);
  if (!info.hasLocation) return null;

  if (info.hasCoordinates && info.latitude !== null && info.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${info.latitude},${info.longitude}`;
  }

  if (info.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(info.address)}`;
  }

  return null;
}
