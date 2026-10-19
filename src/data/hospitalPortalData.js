/**
 * CareLink Emergency - Hospital Operations Portal Demo Data (Part 2)
 *
 * All data in this file is demo/simulation data stored in localStorage for prototyping.
 * Backend database and real-time syncing will be integrated in Part 3.
 */

export const INITIAL_HOSPITAL_DATA = {
  hospital: {
    id: "demo-hospital-001",
    name: "Care Hospital Pune",
    type: "Multi-specialty",
    status: "ACTIVE", // ACTIVE | MAINTENANCE | DIVERTING
    emergencyReadinessScore: 94,
    profileCompletion: 95,
    address: "Plot 14, Senapati Bapat Road, Shivajinagar",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411016",
    phone: "+91 20 2567 8900",
    emergencyPhone: "+91 20 2567 8999",
    ambulanceContact: "+91 20 2567 8911",
    email: "demo@carehospital.com",
    website: "https://carehospital-pune.demo",
    totalBeds: 120,
    establishedYear: "2008",
    description:
      "Care Hospital Pune is a premier tertiary emergency care center equipped with state-of-the-art 24/7 cardiac catheterization, level-3 trauma resuscitation bays, advanced critical care ICUs, and laminar airflow surgical theatres.",
    lastUpdated: "Just now",
    lastUpdatedTimestamp: Date.now()
  },

  beds: {
    general: {
      total: 40,
      occupied: 18
      // available is dynamically calculated as Math.max(0, total - occupied) = 22
    },
    icu: {
      total: 10,
      occupied: 7
      // available = 3
    },
    ventilators: {
      total: 5,
      occupied: 3
      // available = 2
    },
    emergency: {
      total: 8,
      occupied: 4
      // available = 4
    }
  },

  operationTheatre: {
    available: true,
    activeCount: 3,
    total: 4
  },

  bloodBank: {
    status: "Available", // Available | Limited | Unavailable
    lastAudited: "10 minutes ago",
    groups: {
      "A+": 16,
      "A-": 6,
      "B+": 20,
      "B-": 5,
      "O+": 24,
      "O-": 8,
      "AB+": 9,
      "AB-": 3
    }
  },

  doctors: [
    {
      id: "doc-1",
      name: "Dr. Ananya Sharma",
      specialty: "Cardiologist",
      qualification: "MBBS, MD Cardiology",
      experience: "12 years experience",
      status: "On Duty", // On Duty | On Call | Unavailable
      onCall: true,
      workingHours: "8 PM – 8 AM",
      phone: "+91 98230 11234"
    },
    {
      id: "doc-2",
      name: "Dr. Rajesh Kulkarni",
      specialty: "Pulmonologist",
      qualification: "MBBS, MD (Chest & Respiratory), FCCP",
      experience: "11 years experience",
      status: "On Call",
      onCall: true,
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 98230 22345"
    },
    {
      id: "doc-3",
      name: "Dr. Vikram Sethi",
      specialty: "Neurosurgeon",
      qualification: "MBBS, MS, MCh (Neurosurgery)",
      experience: "15 years experience",
      status: "On Duty",
      onCall: true,
      workingHours: "9 AM – 9 PM",
      phone: "+91 98230 33456"
    },
    {
      id: "doc-4",
      name: "Dr. Sunil Deshmukh",
      specialty: "General Surgeon",
      qualification: "MBBS, MS (Gen Surgery), FAIS",
      experience: "16 years experience",
      status: "On Duty",
      onCall: false,
      workingHours: "10 AM – 8 PM",
      phone: "+91 98230 44567"
    },
    {
      id: "doc-5",
      name: "Dr. Neha Patwardhan",
      specialty: "Gynecologist",
      qualification: "MBBS, MS (OBG), DNB",
      experience: "9 years experience",
      status: "On Call",
      onCall: true,
      workingHours: "On-Call Emergency Rotation",
      phone: "+91 98230 55678"
    },
    {
      id: "doc-6",
      name: "Dr. Pradeep Joshi",
      specialty: "Orthopedic",
      qualification: "MBBS, MS (Ortho), Fellowship in Trauma",
      experience: "13 years experience",
      status: "On Duty",
      onCall: true,
      workingHours: "8 AM – 8 PM",
      phone: "+91 98230 66789"
    }
  ],

  facilities: [
    {
      id: "fac-1",
      name: "Emergency / Trauma Care",
      status: "Available", // Available | Limited | Unavailable
      details: "24/7 Level-1 Trauma Bay with resuscitation units",
      capacity: "8 active bays",
      iconName: "ShieldAlert"
    },
    {
      id: "fac-2",
      name: "ICU",
      status: "Available",
      details: "Multi-parameter monitors with central monitoring",
      capacity: "10 isolation/ICU beds",
      iconName: "Activity"
    },
    {
      id: "fac-3",
      name: "Ventilator",
      status: "Available",
      details: "Invasive & Non-invasive mechanical ventilators",
      capacity: "5 ICU-grade ventilators",
      iconName: "Wind"
    },
    {
      id: "fac-4",
      name: "Operation Theatre",
      status: "Available",
      details: "Laminar airflow ultra-sterile surgical suites",
      capacity: "3 active OTs ready",
      iconName: "Crosshair"
    },
    {
      id: "fac-5",
      name: "Blood Bank",
      status: "Available",
      details: "Licensed component separation & plateletpheresis",
      capacity: "All major groups stocked",
      iconName: "Droplet"
    },
    {
      id: "fac-6",
      name: "CT Scan",
      status: "Available",
      details: "128-slice high-speed emergency cardiac & neuro CT",
      capacity: "24/7 operating",
      iconName: "Radio"
    },
    {
      id: "fac-7",
      name: "MRI",
      status: "Available",
      details: "3 Tesla digital wide-bore scanner",
      capacity: "Emergency protocols active",
      iconName: "Scan"
    },
    {
      id: "fac-8",
      name: "Pharmacy",
      status: "Available",
      details: "In-house 24/7 emergency & critical medicine counter",
      capacity: "Full emergency stock",
      iconName: "Pill"
    },
    {
      id: "fac-9",
      name: "Ambulance",
      status: "Available",
      details: "ACLS cardiac & trauma ambulance with ventilator",
      capacity: "2 vehicles on standby",
      iconName: "Truck"
    },
    {
      id: "fac-10",
      name: "Dialysis",
      status: "Limited",
      details: "Emergency bedside hemodialysis in ICU",
      capacity: "2 machines active",
      iconName: "RefreshCw"
    },
    {
      id: "fac-11",
      name: "NICU",
      status: "Available",
      details: "Neonatal intensive care with warmers & phototherapy",
      capacity: "6 neonatal incubators",
      iconName: "Baby"
    },
    {
      id: "fac-12",
      name: "PICU",
      status: "Limited",
      details: "Pediatric intensive care for critical children",
      capacity: "4 pediatric beds",
      iconName: "HeartHandshake"
    }
  ],

  costs: {
    generalBed: 3500,
    icu: 8500,
    ventilator: 4500,
    emergencyConsultation: 1200,
    specialistConsultation: 1500,
    operationTheatre: 18000,
    minEstimatedCost: 5000,
    maxEstimatedCost: 10000,
    budgetTier: "₹5,000–₹10,000/day"
  },

  insurance: [
    "Private Insurance",
    "Cashless Insurance",
    "Ayushman Bharat",
    "Government Schemes",
    "Corporate Insurance"
  ],

  emergencyRequests: [
    {
      id: "ER-1024",
      patientName: "Patient #1024",
      age: 45,
      gender: "Male",
      emergencyType: "Cardiac Emergency",
      symptoms: "Severe crushing chest pain, radiating to left arm, shortness of breath",
      requiredFacilities: ["ICU", "Cardiologist", "Emergency Care"],
      budget: "₹5,000–₹10,000/day",
      insurance: "Private Insurance",
      location: "Pune, Shivajinagar",
      distance: "4.2 km",
      estimatedArrival: "12 min",
      receivedTime: "2 minutes ago",
      timestamp: Date.now() - 2 * 60 * 1000,
      status: "New", // New | Accepted | Cannot Accept | Pending
      statusNote: null,
      confirmedAt: null
    },
    {
      id: "ER-1025",
      patientName: "Patient #1025",
      age: 28,
      gender: "Female",
      emergencyType: "Severe Road Trauma",
      symptoms: "High-speed vehicular accident, suspected pelvic fracture, bleeding",
      requiredFacilities: ["Emergency Care", "Operation Theatre", "Blood Bank", "CT Scan"],
      budget: "Cashless / Insurance",
      insurance: "Cashless Insurance",
      location: "Pune, Deccan Gymkhana",
      distance: "3.1 km",
      estimatedArrival: "8 min",
      receivedTime: "6 minutes ago",
      timestamp: Date.now() - 6 * 60 * 1000,
      status: "New",
      statusNote: null,
      confirmedAt: null
    },
    {
      id: "ER-1022",
      patientName: "Patient #1022",
      age: 67,
      gender: "Male",
      emergencyType: "Acute Respiratory Failure",
      symptoms: "COPD exacerbation, SpO2 78%, severe tachypnea",
      requiredFacilities: ["ICU", "Ventilator", "Pulmonologist"],
      budget: "₹10,000+/day",
      insurance: "Ayushman Bharat",
      location: "Pune, Baner",
      distance: "7.8 km",
      estimatedArrival: "19 min",
      receivedTime: "25 minutes ago",
      timestamp: Date.now() - 25 * 60 * 1000,
      status: "Accepted",
      statusNote: "ICU Bed #04 and Ventilator V-2 prepped. Pulmonologist Dr. Kulkarni notified.",
      confirmedAt: "22 minutes ago"
    },
    {
      id: "ER-1019",
      patientName: "Patient #1019",
      age: 58,
      gender: "Male",
      emergencyType: "Acute Ischemic Stroke",
      symptoms: "Right sided hemiplegia, aphasia, onset within 2 hours",
      requiredFacilities: ["ICU", "Neurosurgeon", "CT Scan"],
      budget: "₹5,000–₹10,000/day",
      insurance: "Private Insurance",
      location: "Pune, Kothrud",
      distance: "6.5 km",
      estimatedArrival: "15 min",
      receivedTime: "1 hour ago",
      timestamp: Date.now() - 60 * 60 * 1000,
      status: "Accepted",
      statusNote: "Stroke protocol activated. CT bay on standby.",
      confirmedAt: "58 minutes ago"
    },
    {
      id: "ER-1015",
      patientName: "Patient #1015",
      age: 72,
      gender: "Female",
      emergencyType: "Septic Shock / Dialysis Needed",
      symptoms: "Multi-organ failure, refractory hypotension, anuria",
      requiredFacilities: ["ICU", "Dialysis", "Ventilator"],
      budget: "Government Schemes",
      insurance: "Government Schemes",
      location: "Pune, Hadapsar",
      distance: "14.2 km",
      estimatedArrival: "35 min",
      receivedTime: "2 hours ago",
      timestamp: Date.now() - 120 * 60 * 1000,
      status: "Cannot Accept",
      statusNote: "Dialysis capacity full",
      confirmedAt: null
    }
  ],

  notifications: [
    {
      id: "notif-1",
      icon: "🚨",
      title: "New emergency request",
      description: "Cardiac Case #ER-1024 incoming from Shivajinagar (ETA 12 min)",
      time: "2m ago",
      unread: true,
      link: "/hospital-portal/emergency-requests"
    },
    {
      id: "notif-2",
      icon: "🛏️",
      title: "ICU availability updated",
      description: "Bed 3 discharged. ICU occupied reduced to 7 / 10.",
      time: "15m ago",
      unread: true,
      link: "/hospital-portal/availability"
    },
    {
      id: "notif-3",
      icon: "👨‍⚕️",
      title: "Specialist availability changed",
      description: "Dr. Rajesh Kulkarni (Pulmonologist) transitioned to On Call",
      time: "35m ago",
      unread: false,
      link: "/hospital-portal/doctors"
    },
    {
      id: "notif-4",
      icon: "⚠️",
      title: "Emergency capacity is limited",
      description: "Ventilators running at 60% capacity (2 available)",
      time: "1h ago",
      unread: false,
      link: "/hospital-portal/availability"
    }
  ]
};

export const SPECIALIST_TYPES = [
  "Cardiologist",
  "Neurologist",
  "Neurosurgeon",
  "Pulmonologist",
  "Orthopedic",
  "General Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Nephrologist",
  "Oncologist",
  "Gastroenterologist",
  "Other"
];

export const ALL_FACILITIES_CATALOG = [
  "Emergency / Trauma Care",
  "ICU",
  "Ventilator",
  "Operation Theatre",
  "Blood Bank",
  "CT Scan",
  "MRI",
  "Pharmacy",
  "Ambulance",
  "Dialysis",
  "NICU",
  "PICU"
];

export const INSURANCE_OPTIONS = [
  "Private Insurance",
  "Cashless Insurance",
  "Ayushman Bharat",
  "Government Schemes",
  "Corporate Insurance",
  "Other"
];

export const REJECTION_REASONS = [
  "ICU unavailable",
  "Specialist unavailable",
  "Ventilator unavailable",
  "Emergency capacity full",
  "Other"
];
