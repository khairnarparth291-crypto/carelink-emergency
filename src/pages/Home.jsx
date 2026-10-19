import React from "react";
import { Link } from "react-router-dom";
import {
  Siren,
  Search,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Phone,
  HeartPulse,
  Bed,
  ArrowRight,
  AlertTriangle,
  PhoneCall
} from "lucide-react";
import { HOSPITALS } from "../data/hospitals";
import AvailabilityBadge from "../components/AvailabilityBadge";

export default function Home() {
  return (
    <div>
      {/* Responsible Emergency Hotlines Strip */}
      <section className="emergency-quickdial-bar" aria-label="National Emergency Helplines">
        <div className="emergency-quickdial-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <span>
              <strong>Life-threatening emergency?</strong> Dial emergency helplines immediately before proceeding:
            </span>
          </div>

          <div className="quickdial-chips">
            <a href="tel:112" className="quickdial-chip" title="Call National Emergency 112">
              <PhoneCall size={13} />
              <span>112 (National Emergency)</span>
            </a>
            <a href="tel:108" className="quickdial-chip" title="Call Medical Ambulance 108">
              <Phone size={13} />
              <span>108 (Ambulance)</span>
            </a>
            <a href="tel:102" className="quickdial-chip" title="Call Maternity / Child 102">
              <Phone size={13} />
              <span>102 (Pregnancy/Pediatric)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
        paddingTop: "3.5rem",
        paddingBottom: "4.5rem",
        borderBottom: "1px solid var(--border-light)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle background glow effect */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "5%",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, rgba(2, 132, 199, 0) 70%)",
          pointerEvents: "none"
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>

            {/* Urgency Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--emergency-light)",
              border: "1px solid var(--emergency-border)",
              color: "var(--emergency-red)",
              padding: "0.4rem 1.1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.1)"
            }}>
              <Siren size={16} />
              <span>Patient & Family Emergency Coordination Portal</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(2.3rem, 5.5vw, 3.6rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem"
            }}>
              Find the Right Emergency Care, <span style={{ color: "var(--brand-blue)" }}>Faster.</span>
            </h1>

            {/* Supporting Text */}
            <p style={{
              fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
              color: "#334155",
              lineHeight: 1.6,
              maxWidth: "700px",
              margin: "0 auto 2.25rem"
            }}>
              Check hospital-reported facilities, live bed availability, on-duty specialists, estimated cost and travel time in one place. Request emergency assistance directly from multiple network hospitals.
            </p>

            {/* Action Buttons - Prominent & Easy to Locate */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
              marginBottom: "2.75rem"
            }}>
              <Link
                to="/emergency"
                className="btn btn-emergency btn-lg"
                id="hero-emergency-cta"
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  letterSpacing: "0.01em",
                  boxShadow: "0 6px 20px rgba(220, 38, 38, 0.45)"
                }}
              >
                <Siren size={22} />
                <span>Request Emergency Assistance</span>
              </Link>

              <Link
                to="/find-hospital"
                className="btn btn-outline btn-lg"
                id="hero-find-hospital-cta"
                style={{
                  padding: "1rem 1.75rem",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  borderColor: "var(--brand-blue)",
                  color: "var(--brand-blue)",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(2, 132, 199, 0.12)"
                }}
              >
                <Search size={20} color="var(--brand-blue)" />
                <span>Find Hospital</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              fontSize: "0.88rem",
              color: "var(--text-muted)"
            }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <CheckCircle2 size={17} color="var(--brand-teal)" />
                <span>8+ Verified Pune Demo Hospitals</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Clock size={17} color="var(--brand-blue)" />
                <span>Freshness Timestamps On Every Hospital</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={17} color="var(--brand-teal)" />
                <span>No Paywalls or Biased Rankings</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Large Emergency Callout Banner */}
      <section style={{ padding: "2.5rem 0", backgroundColor: "var(--bg-page)" }}>
        <div className="container">
          <div style={{
            background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem 2.5rem",
            color: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            boxShadow: "0 10px 25px -5px rgba(185, 28, 28, 0.35)"
          }}>
            <div style={{ maxWidth: "600px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(255, 255, 255, 0.2)",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem"
              }}>
                <Siren size={14} /> Immediate Emergency Triage
              </div>
              <h2 style={{ fontSize: "1.75rem", color: "#ffffff", marginBottom: "0.5rem" }}>
                Is the patient suffering a critical emergency right now?
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#fecaca", lineHeight: 1.5 }}>
                Do not lose crucial golden-hour minutes navigating traffic blindly. Specify the patient's acute needs to filter only hospitals equipped with open ICU beds and relevant specialists.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "240px" }}>
              <Link
                to="/emergency"
                className="btn"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#991b1b",
                  padding: "0.95rem 1.6rem",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                Request Assistance Now
                <ArrowRight size={18} />
              </Link>
              <span style={{ fontSize: "0.78rem", color: "#fee2e2", textAlign: "center" }}>
                100% Free • Direct hospital emergency contacts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Short Platform Explanation & Features */}
      <section style={{ padding: "4rem 0", backgroundColor: "#ffffff", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--brand-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Why CareLink Emergency
            </span>
            <h2 style={{ fontSize: "2.1rem", marginTop: "0.35rem", marginBottom: "1rem" }}>
              Solving Emergency Bed Confusion in Critical Hours
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              During medical emergencies, families spend frantic hours calling multiple hospitals to ask if an ICU bed or specialist is free. CareLink unifies hospital-reported readiness into a clear, instant view.
            </p>
          </div>

          {/* 4 Core Value Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem"
          }}>
            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--brand-blue-subtle)",
                color: "var(--brand-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <Bed size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                Live Bed Visibility
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Check available counts for General Beds, ICU Beds, Ventilators, and Emergency Casualty bays before you begin transit.
              </p>
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#ecfdf5",
                color: "var(--brand-teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <HeartPulse size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                On-Duty Specialists
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Verify if a Cardiologist, Neurologist, Neurosurgeon, or Pulmonologist is on duty, in-house, or on-call right now.
              </p>
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                Verified Freshness Timestamps
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Each card shows exactly when the hospital triage desk updated their numbers (e.g. <em>Verified 2 min ago</em>) to avoid stale data.
              </p>
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--brand-blue-subtle)",
                color: "var(--brand-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                Cost & Scheme Transparency
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Clear daily estimates and instant visibility of Ayushman Bharat, CGHS, and private insurance acceptance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: How It Works (Visual 4-step process) */}
      <section id="how-it-works" style={{ padding: "5rem 0", backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 3.5rem" }}>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--brand-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Step-By-Step Coordination
            </span>
            <h2 style={{ fontSize: "2.1rem", marginTop: "0.35rem", marginBottom: "0.85rem" }}>
              How CareLink Works
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-muted)" }}>
              A 4-step streamlined workflow designed for families under high stress.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            position: "relative"
          }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: "2rem 1.5rem", position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "20px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "var(--brand-blue)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.4)"
              }}>
                1
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: "0.5rem", marginBottom: "0.6rem" }}>
                1. Describe Requirements
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Enter patient details, acute emergency type, required facilities (ICU, Ventilator), and specialist care needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: "2rem 1.5rem", position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "20px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "var(--brand-blue)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.4)"
              }}>
                2
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: "0.5rem", marginBottom: "0.6rem" }}>
                2. Select Casualty Centers
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Select one or multiple accredited hospitals equipped to handle the case based on distance and live bed readiness.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: "2rem 1.5rem", position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "20px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "var(--brand-blue)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.4)"
              }}>
                3
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: "0.5rem", marginBottom: "0.6rem" }}>
                3. Live Triage & Tracking
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Dispatched hospitals review the request in real-time. Follow live status updates for every contacted hospital on your case page.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: "2rem 1.5rem", position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "20px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "var(--emergency-red)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)"
              }}>
                4
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: "0.5rem", marginBottom: "0.6rem" }}>
                4. Rapid Confirmation & Routing
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                When a hospital confirms capacity, immediately access their casualty direct phone, doctor notes, and turn-by-turn navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hospitals Preview */}
      <section style={{ padding: "4.5rem 0", backgroundColor: "#ffffff" }}>
        <div className="container">
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "2.5rem"
          }}>
            <div>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-blue)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Live Network Preview
              </span>
              <h2 style={{ fontSize: "2rem", marginTop: "0.25rem" }}>
                Emergency Hospitals in Pune
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Sample hospital status updates from our demo dataset.
              </p>
            </div>

            <Link to="/hospitals" className="btn btn-outline" style={{ fontWeight: 600 }}>
              <span>View All 8+ Hospitals</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem"
          }}>
            {HOSPITALS.slice(0, 3).map((hospital) => (
              <div key={hospital.id} className="card card-hover" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <AvailabilityBadge status={hospital.emergencyStatus} />
                  <span className="freshness-pill recent">
                    <Clock size={12} />
                    <span>{hospital.lastVerified}</span>
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>
                    <Link to={`/hospital/${hospital.id}`}>{hospital.name}</Link>
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {hospital.address}
                  </p>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                  background: "var(--bg-subtle)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center"
                }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>General</span>
                    <strong style={{ fontSize: "1rem" }}>{hospital.generalBeds.available}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>ICU Beds</span>
                    <strong style={{ fontSize: "1rem", color: hospital.icuBeds.available > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                      {hospital.icuBeds.available}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Ventilators</span>
                    <strong style={{ fontSize: "1rem", color: hospital.ventilators.available > 0 ? "var(--status-available)" : "var(--status-unavailable)" }}>
                      {hospital.ventilators.available}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--brand-navy)" }}>
                    {hospital.distanceText} • {hospital.etaText}
                  </span>
                  <Link to={`/hospital/${hospital.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Disclaimer Banner Section */}
      <section style={{ backgroundColor: "#fef2f2", borderTop: "1px solid var(--emergency-border)", padding: "2.5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AlertTriangle size={28} color="var(--emergency-red)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: "1.05rem", color: "var(--emergency-red)", marginBottom: "0.25rem" }}>
                Emergency Coordination Notice
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#991b1b", lineHeight: 1.5 }}>
                CareLink Emergency coordinates reported capability data. Always verify bed readiness directly with hospital emergency personnel by phone prior to transport. In severe life-threatening events, immediately call <strong>112</strong> or <strong>108</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
