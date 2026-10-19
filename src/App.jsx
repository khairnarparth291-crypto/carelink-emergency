import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { EmergencyProvider, useEmergency } from "./context/EmergencyContext";
import { HospitalPortalProvider } from "./context/HospitalPortalContext";
import { AdminProvider } from "./context/AdminContext";

// Patient Portal Components (Part 1 - Unchanged)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DemoNoticeBanner from "./components/DemoNoticeBanner";
import EmergencyButton from "./components/EmergencyButton";
import CallModal from "./components/CallModal";
import DirectionsModal from "./components/DirectionsModal";

// Patient Portal Pages (Part 1 - Unchanged)
import Home from "./pages/Home";
import Emergency from "./pages/Emergency";
import FindHospital from "./pages/FindHospital";
import Hospitals from "./pages/Hospitals";
import HospitalDetails from "./pages/HospitalDetails";
import EmergencyStatus from "./pages/EmergencyStatus";

// Hospital Portal Components & Layout (Part 2)
import HospitalLayout from "./components/hospital/HospitalLayout";

// Hospital Portal Pages (Part 2)
import HospitalLogin from "./pages/hospital/HospitalLogin";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalAvailability from "./pages/hospital/HospitalAvailability";
import HospitalDoctors from "./pages/hospital/HospitalDoctors";
import HospitalFacilities from "./pages/hospital/HospitalFacilities";
import HospitalCosts from "./pages/hospital/HospitalCosts";
import HospitalEmergencyRequests from "./pages/hospital/HospitalEmergencyRequests";
import HospitalProfile from "./pages/hospital/HospitalProfile";

// Admin Portal Components & Layout (Part 4)
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Admin Portal Pages (Part 4)
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminEmergencies from "./pages/admin/AdminEmergencies";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Modal Container using Emergency Context (Patient Portal)
function GlobalModals() {
  const { activeModal, closeModal } = useEmergency();

  if (!activeModal) return null;

  if (activeModal.type === "call") {
    return <CallModal hospital={activeModal.hospital} onClose={closeModal} />;
  }

  if (activeModal.type === "directions") {
    return <DirectionsModal hospital={activeModal.hospital} onClose={closeModal} />;
  }

  return null;
}

// Main App Router Shell
function AppRoutes() {
  const location = useLocation();
  const isHospitalRoute = location.pathname.startsWith("/hospital-portal");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortal = isHospitalRoute || isAdminRoute;

  return (
    <>
      <ScrollToTop />

      {/* Render Patient Portal Navigation & Emergency Bar ONLY on Patient Routes */}
      {!isPortal && (
        <>
          <DemoNoticeBanner />
          <Navbar />
        </>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          {/* =========================================
              PART 1: PATIENT & FAMILY PORTAL ROUTES
              ========================================= */}
          <Route path="/" element={<Home />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/find-hospital" element={<FindHospital />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospital/:id" element={<HospitalDetails />} />
          <Route path="/emergency-status/:requestId" element={<EmergencyStatus />} />

          {/* =========================================
              PART 2: HOSPITAL PORTAL ROUTES
              ========================================= */}
          <Route path="/hospital-portal/login" element={<HospitalLogin />} />

          <Route path="/hospital-portal" element={<HospitalLayout />}>
            <Route index element={<HospitalDashboard />} />
            <Route path="availability" element={<HospitalAvailability />} />
            <Route path="doctors" element={<HospitalDoctors />} />
            <Route path="facilities" element={<HospitalFacilities />} />
            <Route path="costs" element={<HospitalCosts />} />
            <Route path="emergency-requests" element={<HospitalEmergencyRequests />} />
            <Route path="profile" element={<HospitalProfile />} />
          </Route>

          {/* =========================================
              PART 3: ADMIN GOVERNANCE PORTAL ROUTES
              ========================================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              <Route path="emergencies" element={<AdminEmergencies />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>
          </Route>

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Render Patient Portal Footer & Floating Buttons ONLY on Patient Routes */}
      {!isPortal && (
        <>
          <Footer />
          <EmergencyButton />
          <GlobalModals />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <EmergencyProvider>
      <HospitalPortalProvider>
        <AdminProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AdminProvider>
      </HospitalPortalProvider>
    </EmergencyProvider>
  );
}
