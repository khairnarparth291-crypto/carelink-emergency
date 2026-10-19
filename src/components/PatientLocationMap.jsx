import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Navigation, MapPin, ExternalLink } from "lucide-react";
import { formatCoordinates, getDirectionsUrl } from "../utils/locationHelper";

/**
 * PatientLocationMap
 *
 * Renders an OpenStreetMap Leaflet map with a custom emergency marker
 * for a patient's selected coordinates. Fully responsive and accessible.
 */
export default function PatientLocationMap({
  latitude,
  longitude,
  address,
  source = "gps",
  height = "240px",
  zoom = 15,
  interactive = true,
  showDirectionsButton = true,
  directionsLabel = "Get Directions",
  className = ""
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const hasValidCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  useEffect(() => {
    if (!hasValidCoords || !mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: false,
        attributionControl: true
      });

      // Standard OpenStreetMap tile layer with required attribution
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom high-contrast pulse emergency marker icon
      const pulseIcon = L.divIcon({
        className: "leaflet-emergency-marker",
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(220, 38, 38, 0.28); animation: pulse-marker-ring 2s infinite ease-out;"></div>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #dc2626; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17]
      });

      const marker = L.marker([latitude, longitude], { icon: pulseIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">
            ${source === "gps" ? "📍 GPS Patient Location" : "📍 Patient Location"}
          </strong>
          ${address ? `<span style="color: #475569;">${address}</span><br/>` : ""}
          <span style="font-size: 11px; color: #64748b; font-family: monospace;">
            ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
          </span>
        </div>
      `;
      marker.bindPopup(popupContent);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Invalidate size to handle dynamic flexbox/grid containers
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerInstanceRef.current = null;
        }
      };
    } else {
      // Update existing map view and marker position
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [latitude, longitude, zoom, interactive, hasValidCoords, source, address]);

  if (!hasValidCoords) {
    return (
      <div
        style={{
          height: height,
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px dashed #cbd5e1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          padding: "1rem",
          textAlign: "center"
        }}
      >
        <MapPin size={24} style={{ marginBottom: "0.5rem", color: "#94a3b8" }} />
        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
          {address ? `Address: ${address}` : "Location not provided."}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
          Coordinates unavailable for map display.
        </span>
      </div>
    );
  }

  const directionsUrl = getDirectionsUrl({ latitude, longitude, address });

  return (
    <div
      className={`patient-location-map-wrapper ${className}`}
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid var(--border-light, #e2e8f0)",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}
    >
      {/* Leaflet map container */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: height,
          zIndex: 1
        }}
        aria-label="Patient location map"
      />

      {/* Info and Actions Toolbar */}
      <div
        style={{
          padding: "0.7rem 0.9rem",
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          fontSize: "0.82rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: source === "gps" ? "#ecfdf5" : "#f1f5f9",
              color: source === "gps" ? "#065f46" : "#475569",
              fontSize: "0.74rem",
              fontWeight: 600,
              border: `1px solid ${source === "gps" ? "#a7f3d0" : "#cbd5e1"}`
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: source === "gps" ? "#10b981" : "#64748b"
              }}
            />
            <span>{source === "gps" ? "GPS Coordinates" : "Manual Entry"}</span>
          </span>

          <span style={{ color: "#334155", fontFamily: "monospace", fontSize: "0.8rem" }}>
            {formatCoordinates(latitude, longitude)}
          </span>
        </div>

        {showDirectionsButton && directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              fontSize: "0.8rem",
              color: "var(--brand-blue, #0284c7)",
              borderColor: "var(--brand-blue, #0284c7)",
              backgroundColor: "#ffffff",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 600
            }}
            id="get-directions-btn"
          >
            <Navigation size={13} />
            <span>{directionsLabel}</span>
            <ExternalLink size={12} style={{ opacity: 0.7 }} />
          </a>
        )}
      </div>
    </div>
  );
}
