/**
 * CareLink Emergency - Demo Hospital Dataset
 *
 * IMPORTANT DISCLAIMER:
 * ALL DATA IN THIS FILE IS DEMO DATA FOR PROTOTYPING & SIMULATION PURPOSES.
 * Hospital bed availability, specialist rosters, and pricing in this prototype
 * are illustrative and NOT real-time medical facts.
 */

export const DEMO_NOTICE = "DEMO DATA: Hospital availability changes rapidly. Always confirm directly before travelling.";

export const HOSPITALS = [
  {
    id: "care-hospital-pune",
    _id: "670100000000000000000010",
    name: "Care Hospital Pune",
    address: "Plot 14, Senapati Bapat Road, Shivajinagar",
    city: "Pune, Maharashtra",
    distance: 3.5,
    distanceText: "3.5 km",
    eta: 10,
    etaText: "10 min",
    emergencyStatus: "available", // 'available' | 'limited' | 'unavailable'
    generalBeds: { available: 22, total: 40 },
    icuBeds: { available: 3, total: 10 },
    ventilators: { available: 2, total: 5 },
    emergencyBeds: { available: 4, total: 8 },
    operationTheatre: { available: true, activeTheatres: 3, total: 4 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "O-", "AB+"] },
    specialists: [
      {
        id: "s1",
        name: "Dr. Ananya Sharma",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "14 yrs",
        qualifications: "MD, DM (Cardiology)"
      },
      {
        id: "s2",
        name: "Dr. Rajesh Kulkarni",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "On Call",
        experience: "11 yrs",
        qualifications: "MD (Chest & Respiratory)"
      },
      {
        id: "s3",
        name: "Dr. Sunil Deshmukh",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "In House",
        experience: "16 yrs",
        qualifications: "MS, MCh"
      },
      {
        id: "s4",
        name: "Dr. Neha Patwardhan",
        specialty: "Gynecologist",
        status: "Available",
        onCall: "On Call",
        experience: "9 yrs",
        qualifications: "MS (OBG), DNB"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Advanced Level-3 Intensive Care" },
      { id: "f2", name: "Ventilator", available: true, description: "Invasive & Non-invasive support" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24/7 dedicated trauma bay" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Laminar airflow emergency OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "Licensed component separation" },
      { id: "f6", name: "CT Scan", available: true, description: "128-slice rapid CT" },
      { id: "f7", name: "MRI", available: true, description: "3 Tesla digital scanner" },
      { id: "f8", name: "Pharmacy", available: true, description: "24/7 in-house emergency pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "Advanced Cardiac Life Support (ACLS)" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat", "Government Scheme", "Cashless TPA"],
    estimatedCost: {
      budgetTier: "₹5,000–₹10,000/day",
      generalBed: "₹3,500/day",
      icu: "₹8,500/day",
      consultation: "₹800",
      emergencyConsultation: "₹1,200",
      dailyRange: "₹7,000–₹10,000/day"
    },
    lastVerified: "Verified 2 min ago",
    lastVerifiedMinutes: 2,
    phone: "+91 20 2567 8900",
    emergencyHelpline: "+91 20 2567 8999",
    ambulanceContact: "+91 20 2567 8911",
    coordinates: { lat: 18.5314, lng: 73.8344 }
  },
  {
    id: "apollo-care-pune",
    _id: "670100000000000000000020",
    name: "Apollo Care Hospital — Pune",
    address: "Plot 22, Old Mumbai-Pune Highway, Wakad",
    city: "Pune, Maharashtra",
    distance: 4.8,
    distanceText: "4.8 km",
    eta: 14,
    etaText: "14 min",
    emergencyStatus: "available", // 'available' | 'limited' | 'unavailable'
    generalBeds: { available: 15, total: 60 },
    icuBeds: { available: 5, total: 16 },
    ventilators: { available: 3, total: 8 },
    emergencyBeds: { available: 4, total: 12 },
    operationTheatre: { available: true, activeTheatres: 3, total: 4 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "O-", "AB+"] },
    specialists: [
      {
        id: "s101",
        name: "Dr. Ananya Sharma",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "14 yrs",
        qualifications: "MD, DM (Cardiology)"
      },
      {
        id: "s102",
        name: "Dr. Rajesh Kulkarni",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "On Call",
        experience: "11 yrs",
        qualifications: "MD (Chest & Respiratory)"
      },
      {
        id: "s103",
        name: "Dr. Sunil Deshmukh",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "In House",
        experience: "16 yrs",
        qualifications: "MS, MCh"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Advanced Level-3 Intensive Care" },
      { id: "f2", name: "Ventilator", available: true, description: "Invasive & Non-invasive support" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24/7 dedicated trauma bay" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Laminar airflow emergency OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "Licensed component separation" },
      { id: "f6", name: "CT Scan", available: true, description: "128-slice rapid CT" },
      { id: "f7", name: "MRI", available: true, description: "3 Tesla digital scanner" },
      { id: "f8", name: "Pharmacy", available: true, description: "24/7 in-house emergency pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "Advanced Cardiac Life Support (ACLS)" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat", "Government Scheme", "Cashless TPA"],
    estimatedCost: {
      budgetTier: "₹5,000–₹10,000/day",
      generalBed: "₹3,800/day",
      icu: "₹9,500/day",
      consultation: "₹900",
      emergencyConsultation: "₹1,400",
      dailyRange: "₹8,000–₹12,000/day"
    },
    lastVerified: "Verified 5 min ago",
    lastVerifiedMinutes: 5,
    phone: "+91 20 6789 1200",
    emergencyHelpline: "+91 20 6789 1299",
    ambulanceContact: "+91 20 6789 1211",
    coordinates: { lat: 18.5987, lng: 73.7654 }
  },
  {
    id: "ruby-metro-pune",
    _id: "670100000000000000000030",
    name: "Ruby Metro Multispeciality Hospital",
    address: "40 Sassoon Road, Near Railway Station",
    city: "Pune, Maharashtra",
    distance: 2.8,
    distanceText: "2.8 km",
    eta: 8,
    etaText: "8 min",
    emergencyStatus: "available",
    generalBeds: { available: 18, total: 110 },
    icuBeds: { available: 5, total: 24 },
    ventilators: { available: 3, total: 12 },
    emergencyBeds: { available: 6, total: 15 },
    operationTheatre: { available: true, activeTheatres: 4, total: 6 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    specialists: [
      {
        id: "s201",
        name: "Dr. Vikramaditya Joshi",
        specialty: "Neurologist",
        status: "Available",
        onCall: "In House",
        experience: "18 yrs",
        qualifications: "MD, DM (Neuro)"
      },
      {
        id: "s202",
        name: "Dr. Sameer Gaikwad",
        specialty: "Neurosurgeon",
        status: "Available",
        onCall: "On Call",
        experience: "15 yrs",
        qualifications: "MCh (Neurosurgery)"
      },
      {
        id: "s203",
        name: "Dr. Priya Rao",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "12 yrs",
        qualifications: "MD, DNB (Cardiology)"
      },
      {
        id: "s204",
        name: "Dr. Anand Chitale",
        specialty: "Orthopedic",
        status: "Available",
        onCall: "In House",
        experience: "14 yrs",
        qualifications: "MS (Ortho), Fellowship"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Neuro & Cardiac Dedicated ICUs" },
      { id: "f2", name: "Ventilator", available: true, description: "Advanced mechanical ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Level-1 comprehensive trauma centre" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Modular neuro-surgical OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "24/7 NABL certified blood centre" },
      { id: "f6", name: "CT Scan", available: true, description: "Dual-source 256-slice CT" },
      { id: "f7", name: "MRI", available: true, description: "High-field 3T MRI" },
      { id: "f8", name: "Pharmacy", available: true, description: "Round the clock trauma pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "GPS enabled critical care ambulance" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat", "Government Scheme"],
    estimatedCost: {
      budgetTier: "₹10,000–₹20,000/day",
      generalBed: "₹4,800/day",
      icu: "₹12,500/day",
      consultation: "₹1,000",
      emergencyConsultation: "₹1,500",
      dailyRange: "₹11,000–₹16,000/day"
    },
    lastVerified: "Verified 2 min ago",
    lastVerifiedMinutes: 2,
    phone: "+91 20 2616 3399",
    emergencyHelpline: "+91 20 2616 3333",
    ambulanceContact: "+91 20 2616 3300",
    coordinates: { lat: 18.5284, lng: 73.8743 }
  },
  {
    id: "sahyadri-care-deccan",
    _id: "670100000000000000000060",
    name: "Sahyadri Care Hospital — Deccan",
    address: "Plot 30-C, Karve Road, Deccan Gymkhana",
    city: "Pune, Maharashtra",
    distance: 3.5,
    distanceText: "3.5 km",
    eta: 10,
    etaText: "10 min",
    emergencyStatus: "available",
    generalBeds: { available: 9, total: 80 },
    icuBeds: { available: 2, total: 15 },
    ventilators: { available: 1, total: 6 },
    emergencyBeds: { available: 3, total: 8 },
    operationTheatre: { available: true, activeTheatres: 2, total: 3 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "AB+"] },
    specialists: [
      {
        id: "s301",
        name: "Dr. Milind Soman",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "On Call",
        experience: "13 yrs",
        qualifications: "MD, DM"
      },
      {
        id: "s302",
        name: "Dr. Arundhati Kelkar",
        specialty: "Pediatrician",
        status: "Available",
        onCall: "In House",
        experience: "11 yrs",
        qualifications: "MD (Pediatrics)"
      },
      {
        id: "s303",
        name: "Dr. Rahul Shinde",
        specialty: "Orthopedic",
        status: "Available",
        onCall: "In House",
        experience: "15 yrs",
        qualifications: "MS (Ortho)"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Intensive Cardiac Care Unit (ICCU)" },
      { id: "f2", name: "Ventilator", available: true, description: "Dedicated pediatric & adult ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Rapid response resuscitation unit" },
      { id: "f4", name: "Operation Theatre", available: true, description: "24/7 emergency surgical suite" },
      { id: "f5", name: "Blood Bank", available: true, description: "Emergency whole blood & components" },
      { id: "f6", name: "CT Scan", available: true, description: "64-slice multi-detector CT" },
      { id: "f7", name: "MRI", available: false, description: "Referral tie-up within 1 km" },
      { id: "f8", name: "Pharmacy", available: true, description: "In-campus 24x7 supply" },
      { id: "f9", name: "Ambulance", available: true, description: "Basic & ICU on Wheels" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat"],
    estimatedCost: {
      budgetTier: "₹5,000–₹10,000/day",
      generalBed: "₹3,200/day",
      icu: "₹7,800/day",
      consultation: "₹750",
      emergencyConsultation: "₹1,100",
      dailyRange: "₹6,500–₹9,500/day"
    },
    lastVerified: "Verified 6 min ago",
    lastVerifiedMinutes: 6,
    phone: "+91 20 6721 5000",
    emergencyHelpline: "+91 20 6721 5100",
    ambulanceContact: "+91 20 6721 5108",
    coordinates: { lat: 18.5147, lng: 73.8398 }
  },
  {
    id: "bharati-medical-dhankawadi",
    _id: "670100000000000000000070",
    name: "Bharati Trust Hospital & Research Centre",
    address: "Pune-Satara Road, Dhankawadi",
    city: "Pune, Maharashtra",
    distance: 6.8,
    distanceText: "6.8 km",
    eta: 18,
    etaText: "18 min",
    emergencyStatus: "available",
    generalBeds: { available: 35, total: 300 },
    icuBeds: { available: 7, total: 30 },
    ventilators: { available: 4, total: 16 },
    emergencyBeds: { available: 8, total: 20 },
    operationTheatre: { available: true, activeTheatres: 5, total: 8 },
    bloodBank: { available: true, inStockGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    specialists: [
      {
        id: "s401",
        name: "Dr. Santosh Chavan",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "In House",
        experience: "20 yrs",
        qualifications: "MS, FRCS"
      },
      {
        id: "s402",
        name: "Dr. Meera Gokhale",
        specialty: "Gynecologist",
        status: "Available",
        onCall: "In House",
        experience: "14 yrs",
        qualifications: "MD, DGO"
      },
      {
        id: "s403",
        name: "Dr. Prakash Mane",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "On Call",
        experience: "10 yrs",
        qualifications: "MD (Pulm)"
      },
      {
        id: "s404",
        name: "Dr. Sandeep Jadhav",
        specialty: "Pediatrician",
        status: "Available",
        onCall: "In House",
        experience: "12 yrs",
        qualifications: "MD (Ped)"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Subsidized & charitable ICU ward" },
      { id: "f2", name: "Ventilator", available: true, description: "High flow oxygen & invasive ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24-bed emergency casualty ward" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Equipped multi-specialty trauma OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "Large university blood bank" },
      { id: "f6", name: "CT Scan", available: true, description: "Subsidized diagnostic CT" },
      { id: "f7", name: "MRI", available: true, description: "1.5T MRI unit" },
      { id: "f8", name: "Pharmacy", available: true, description: "Affordable Jan Aushadhi & 24/7 store" },
      { id: "f9", name: "Ambulance", available: true, description: "Fleet of 4 emergency ambulances" }
    ],
    insurance: ["Ayushman Bharat", "Government Scheme", "Private Insurance"],
    estimatedCost: {
      budgetTier: "₹0–₹5,000/day",
      generalBed: "₹1,200/day",
      icu: "₹4,200/day",
      consultation: "₹350",
      emergencyConsultation: "₹500",
      dailyRange: "₹2,500–₹4,800/day"
    },
    lastVerified: "Verified 8 min ago",
    lastVerifiedMinutes: 8,
    phone: "+91 20 2437 3226",
    emergencyHelpline: "+91 20 2437 3222",
    ambulanceContact: "+91 20 2437 3108",
    coordinates: { lat: 18.4601, lng: 73.8582 }
  },
  {
    id: "jupiter-baner-pune",
    _id: "670100000000000000000080",
    name: "Jupiter Premier Hospital — Baner",
    address: "Near Balewadi High Street, Baner",
    city: "Pune, Maharashtra",
    distance: 8.4,
    distanceText: "8.4 km",
    eta: 20,
    etaText: "20 min",
    emergencyStatus: "available",
    generalBeds: { available: 16, total: 120 },
    icuBeds: { available: 4, total: 22 },
    ventilators: { available: 3, total: 10 },
    emergencyBeds: { available: 5, total: 12 },
    operationTheatre: { available: true, activeTheatres: 4, total: 5 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "AB+"] },
    specialists: [
      {
        id: "s501",
        name: "Dr. Ashish Kothari",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "17 yrs",
        qualifications: "MD, DM (Cardio), FACC"
      },
      {
        id: "s502",
        name: "Dr. Varun Agarwal",
        specialty: "Neurosurgeon",
        status: "Available",
        onCall: "In House",
        experience: "19 yrs",
        qualifications: "MS, MCh (Neurosurgery)"
      },
      {
        id: "s503",
        name: "Dr. Shilpa Nair",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "On Call",
        experience: "11 yrs",
        qualifications: "MD, FICP"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Tertiary level surgical & medical ICU" },
      { id: "f2", name: "Ventilator", available: true, description: "Servo-u smart ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Rapid triage resuscitation wing" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Robotic assisted emergency suites" },
      { id: "f5", name: "Blood Bank", available: true, description: "Component separation & apheresis" },
      { id: "f6", name: "CT Scan", available: true, description: "Spectral CT technology" },
      { id: "f7", name: "MRI", available: true, description: "Wide bore 3T MRI" },
      { id: "f8", name: "Pharmacy", available: true, description: "Full inventory 24/7 pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "Mobile ICU unit with telemedicine" }
    ],
    insurance: ["Private Insurance", "Government Scheme"],
    estimatedCost: {
      budgetTier: "₹20,000+/day",
      generalBed: "₹7,500/day",
      icu: "₹22,000/day",
      consultation: "₹1,500",
      emergencyConsultation: "₹2,200",
      dailyRange: "₹21,000–₹28,000/day"
    },
    lastVerified: "Verified 3 min ago",
    lastVerifiedMinutes: 3,
    phone: "+91 20 2799 1000",
    emergencyHelpline: "+91 20 2799 1108",
    ambulanceContact: "+91 20 2799 1199",
    coordinates: { lat: 18.5714, lng: 73.7749 }
  },
  {
    id: "sancheti-ortho-shivaji",
    _id: "670100000000000000000090",
    name: "Sancheti Emergency & Trauma Hospital",
    address: "16 Shivajinagar, Near Agriculture College",
    city: "Pune, Maharashtra",
    distance: 3.1,
    distanceText: "3.1 km",
    eta: 9,
    etaText: "9 min",
    emergencyStatus: "limited", // Limited availability
    generalBeds: { available: 5, total: 90 },
    icuBeds: { available: 1, total: 12 },
    ventilators: { available: 0, total: 4 }, // No ventilators currently available
    emergencyBeds: { available: 2, total: 8 },
    operationTheatre: { available: true, activeTheatres: 3, total: 4 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+"] },
    specialists: [
      {
        id: "s601",
        name: "Dr. Parag Sancheti",
        specialty: "Orthopedic",
        status: "Available",
        onCall: "In House",
        experience: "25 yrs",
        qualifications: "MS (Ortho), MCh, FRCS"
      },
      {
        id: "s602",
        name: "Dr. Chetan Pradhan",
        specialty: "Orthopedic",
        status: "Available",
        onCall: "In House",
        experience: "21 yrs",
        qualifications: "MS Ortho (Trauma Lead)"
      },
      {
        id: "s603",
        name: "Dr. Kirti Kadam",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "On Call",
        experience: "13 yrs",
        qualifications: "MS (General Surgery)"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Trauma ICU (1 bed currently open)" },
      { id: "f2", name: "Ventilator", available: false, description: "All 4 mechanical units currently occupied" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Super-specialized bone & poly-trauma bay" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Ultra-clean orthopaedic trauma OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "24/7 dedicated blood storage" },
      { id: "f6", name: "CT Scan", available: true, description: "High resolution musculoskeletal CT" },
      { id: "f7", name: "MRI", available: true, description: "Advanced joint & spinal imaging" },
      { id: "f8", name: "Pharmacy", available: true, description: "Specialized trauma implants & medicines" },
      { id: "f9", name: "Ambulance", available: true, description: "Spinal immobilization equipped ambulance" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat", "Government Scheme"],
    estimatedCost: {
      budgetTier: "₹5,000–₹10,000/day",
      generalBed: "₹3,800/day",
      icu: "₹8,900/day",
      consultation: "₹900",
      emergencyConsultation: "₹1,300",
      dailyRange: "₹8,000–₹11,000/day"
    },
    lastVerified: "Verified 11 min ago",
    lastVerifiedMinutes: 11,
    phone: "+91 20 2899 9999",
    emergencyHelpline: "+91 20 2899 9100",
    ambulanceContact: "+91 20 2899 9108",
    coordinates: { lat: 18.5323, lng: 73.8504 }
  },
  {
    id: "kem-charity-rasta-peth",
    _id: "670100000000000000000100",
    name: "KEM Memorial Hospital — Rasta Peth",
    address: "489 Rasta Peth, Near Sardar Moodliar Road",
    city: "Pune, Maharashtra",
    distance: 3.9,
    distanceText: "3.9 km",
    eta: 11,
    etaText: "11 min",
    emergencyStatus: "available",
    generalBeds: { available: 22, total: 150 },
    icuBeds: { available: 4, total: 20 },
    ventilators: { available: 2, total: 8 },
    emergencyBeds: { available: 4, total: 14 },
    operationTheatre: { available: true, activeTheatres: 3, total: 5 },
    bloodBank: { available: true, inStockGroups: ["A+", "A-", "B+", "O+", "O-"] },
    specialists: [
      {
        id: "s701",
        name: "Dr. Farokh Udwadia",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "In House",
        experience: "22 yrs",
        qualifications: "MD, FRCP"
      },
      {
        id: "s702",
        name: "Dr. Smita Bapat",
        specialty: "Pediatrician",
        status: "Available",
        onCall: "In House",
        experience: "16 yrs",
        qualifications: "MD (Pediatrics), DCH"
      },
      {
        id: "s703",
        name: "Dr. Vivek Apte",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "In House",
        experience: "18 yrs",
        qualifications: "MS (General Surgery)"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Medical, Neonatal (NICU) & Pediatric ICUs" },
      { id: "f2", name: "Ventilator", available: true, description: "Neonatal & adult mechanical ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24/7 central casualty unit" },
      { id: "f4", name: "Operation Theatre", available: true, description: "General & pediatric emergency OTs" },
      { id: "f5", name: "Blood Bank", available: true, description: "Regional blood transfusion centre" },
      { id: "f6", name: "CT Scan", available: true, description: "Diagnostic multi-slice scanner" },
      { id: "f7", name: "MRI", available: false, description: "External tie-up facility" },
      { id: "f8", name: "Pharmacy", available: true, description: "Subsidized non-profit hospital pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "2 on-call critical transport vehicles" }
    ],
    insurance: ["Ayushman Bharat", "Government Scheme", "Private Insurance"],
    estimatedCost: {
      budgetTier: "₹0–₹5,000/day",
      generalBed: "₹1,500/day",
      icu: "₹4,500/day",
      consultation: "₹400",
      emergencyConsultation: "₹600",
      dailyRange: "₹3,000–₹5,000/day"
    },
    lastVerified: "Verified 5 min ago",
    lastVerifiedMinutes: 5,
    phone: "+91 20 6603 7300",
    emergencyHelpline: "+91 20 6603 7373",
    ambulanceContact: "+91 20 6603 7380",
    coordinates: { lat: 18.5196, lng: 73.8687 }
  },
  {
    id: "manipal-kharadi-pune",
    _id: "670100000000000000000110",
    name: "Manipal Super Specialty Hospital — Kharadi",
    address: "Survey No 22/2A, Mundhwa - Kharadi Bypass",
    city: "Pune, Maharashtra",
    distance: 9.7,
    distanceText: "9.7 km",
    eta: 24,
    etaText: "24 min",
    emergencyStatus: "available",
    generalBeds: { available: 14, total: 100 },
    icuBeds: { available: 3, total: 16 },
    ventilators: { available: 2, total: 6 },
    emergencyBeds: { available: 4, total: 10 },
    operationTheatre: { available: true, activeTheatres: 3, total: 4 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "AB+"] },
    specialists: [
      {
        id: "s801",
        name: "Dr. Tarun Grover",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "15 yrs",
        qualifications: "MD, DNB (Cardiology)"
      },
      {
        id: "s802",
        name: "Dr. Snehal Kulkarni",
        specialty: "Neurologist",
        status: "Available",
        onCall: "On Call",
        experience: "12 yrs",
        qualifications: "DM (Neurology)"
      },
      {
        id: "s803",
        name: "Dr. Ritu Pande",
        specialty: "Gynecologist",
        status: "Available",
        onCall: "In House",
        experience: "14 yrs",
        qualifications: "MD (OBG), MRCOG"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Advanced Level 3 Intensive Care" },
      { id: "f2", name: "Ventilator", available: true, description: "Modern respiratory support systems" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24-hour certified stroke and STEMI care" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Modular digital theatres" },
      { id: "f5", name: "Blood Bank", available: true, description: "Full blood components available" },
      { id: "f6", name: "CT Scan", available: true, description: "Ultra-fast low-dose CT" },
      { id: "f7", name: "MRI", available: true, description: "Silent MRI scanner" },
      { id: "f8", name: "Pharmacy", available: true, description: "24x7 emergency medical store" },
      { id: "f9", name: "Ambulance", available: true, description: "Advanced life support team on wheels" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat", "Government Scheme"],
    estimatedCost: {
      budgetTier: "₹10,000–₹20,000/day",
      generalBed: "₹5,200/day",
      icu: "₹13,800/day",
      consultation: "₹1,100",
      emergencyConsultation: "₹1,600",
      dailyRange: "₹12,000–₹17,000/day"
    },
    lastVerified: "Verified 7 min ago",
    lastVerifiedMinutes: 7,
    phone: "+91 20 6744 5566",
    emergencyHelpline: "+91 20 6744 5599",
    ambulanceContact: "+91 20 6744 5500",
    coordinates: { lat: 18.5492, lng: 73.9352 }
  },
  {
    id: "jehangir-station-pune",
    _id: "670100000000000000000120",
    name: "Jehangir Hospital — Central Pune",
    address: "32 Sassoon Road, Opposite Pune Railway Station",
    city: "Pune, Maharashtra",
    distance: 2.9,
    distanceText: "2.9 km",
    eta: 9,
    etaText: "9 min",
    emergencyStatus: "unavailable", // ICU and Ventilator completely full right now
    generalBeds: { available: 2, total: 140 },
    icuBeds: { available: 0, total: 20 }, // 0 ICU beds
    ventilators: { available: 0, total: 8 }, // 0 ventilators
    emergencyBeds: { available: 1, total: 10 },
    operationTheatre: { available: true, activeTheatres: 4, total: 5 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+"] },
    specialists: [
      {
        id: "s901",
        name: "Dr. Suhas Hardas",
        specialty: "Cardiologist",
        status: "Busy",
        onCall: "In Surgery",
        experience: "24 yrs",
        qualifications: "MD, DM (Cardiology)"
      },
      {
        id: "s902",
        name: "Dr. Nitin Gadkari",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "On Call",
        experience: "15 yrs",
        qualifications: "MS, DNB"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: false, description: "Currently operating at 100% capacity" },
      { id: "f2", name: "Ventilator", available: false, description: "All mechanical ventilators currently in use" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Emergency triage active" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Emergency OT reserved for stabilization" },
      { id: "f5", name: "Blood Bank", available: true, description: "Blood component stock active" },
      { id: "f6", name: "CT Scan", available: true, description: "Diagnostic imaging open" },
      { id: "f7", name: "MRI", available: true, description: "3T MRI unit" },
      { id: "f8", name: "Pharmacy", available: true, description: "24 hour pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "Emergency ambulance stationed" }
    ],
    insurance: ["Private Insurance", "Ayushman Bharat"],
    estimatedCost: {
      budgetTier: "₹10,000–₹20,000/day",
      generalBed: "₹4,500/day",
      icu: "₹11,000/day",
      consultation: "₹950",
      emergencyConsultation: "₹1,400",
      dailyRange: "₹10,000–₹15,000/day"
    },
    lastVerified: "Verified 1 min ago",
    lastVerifiedMinutes: 1,
    phone: "+91 20 6681 9999",
    emergencyHelpline: "+91 20 6681 9900",
    ambulanceContact: "+91 20 6681 9911",
    coordinates: { lat: 18.5278, lng: 73.8732 }
  },
  {
    id: "lilavati-care-mumbai",
    _id: "670100000000000000000040",
    name: "Lilavati Hospital & Research Centre — Mumbai",
    address: "A-791, Bandra Reclamation, Bandra West",
    city: "Mumbai, Maharashtra",
    distance: 5.4,
    distanceText: "5.4 km",
    eta: 16,
    etaText: "16 min",
    emergencyStatus: "available",
    generalBeds: { available: 22, total: 140 },
    icuBeds: { available: 6, total: 30 },
    ventilators: { available: 4, total: 15 },
    emergencyBeds: { available: 8, total: 18 },
    operationTheatre: { available: true, activeTheatres: 5, total: 8 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "O+", "O-", "AB+", "AB-"] },
    specialists: [
      {
        id: "s-mumbai-101",
        name: "Dr. Suresh Rao",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "19 yrs",
        qualifications: "MD, DM (Cardiology)"
      },
      {
        id: "s-mumbai-102",
        name: "Dr. Meera Desai",
        specialty: "Neurologist",
        status: "Available",
        onCall: "On Call",
        experience: "15 yrs",
        qualifications: "MD, DM (Neurology)"
      },
      {
        id: "s-mumbai-103",
        name: "Dr. Amit Shah",
        specialty: "General Surgeon",
        status: "Available",
        onCall: "In House",
        experience: "17 yrs",
        qualifications: "MS, MCh"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Tertiary Level-3 Intensive Care Unit" },
      { id: "f2", name: "Ventilator", available: true, description: "Advanced mechanical ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "24/7 Level-1 trauma and casualty bay" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Laminar airflow emergency surgical suites" },
      { id: "f5", name: "Blood Bank", available: true, description: "Licensed component separation & blood bank" },
      { id: "f6", name: "CT Scan", available: true, description: "256-slice cardiac and body CT" },
      { id: "f7", name: "MRI", available: true, description: "3 Tesla digital MRI" },
      { id: "f8", name: "Pharmacy", available: true, description: "24/7 in-house emergency pharmacy" },
      { id: "f9", name: "Ambulance", available: true, description: "Advanced Cardiac Life Support (ACLS) fleet" }
    ],
    insurance: ["Private Insurance", "Cashless Insurance", "Ayushman Bharat", "Government Scheme"],
    estimatedCost: {
      budgetTier: "₹10,000–₹20,000/day",
      generalBed: "₹5,200/day",
      icu: "₹14,000/day",
      consultation: "₹1,200",
      emergencyConsultation: "₹1,800",
      dailyRange: "₹12,000–₹18,000/day"
    },
    lastVerified: "Verified 3 min ago",
    lastVerifiedMinutes: 3,
    phone: "+91 22 2675 1000",
    emergencyHelpline: "+91 22 2675 1111",
    ambulanceContact: "+91 22 2675 1108",
    coordinates: { lat: 19.0522, lng: 72.8317 }
  },
  {
    id: "kokilaben-metro-mumbai",
    _id: "670100000000000000000050",
    name: "Kokilaben Metro Multispeciality Hospital — Mumbai",
    address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
    city: "Mumbai, Maharashtra",
    distance: 6.8,
    distanceText: "6.8 km",
    eta: 20,
    etaText: "20 min",
    emergencyStatus: "available",
    generalBeds: { available: 30, total: 180 },
    icuBeds: { available: 8, total: 40 },
    ventilators: { available: 5, total: 20 },
    emergencyBeds: { available: 10, total: 24 },
    operationTheatre: { available: true, activeTheatres: 6, total: 10 },
    bloodBank: { available: true, inStockGroups: ["A+", "B+", "B-", "O+", "O-", "AB+"] },
    specialists: [
      {
        id: "s-mumbai-201",
        name: "Dr. Rajiv Parikh",
        specialty: "Cardiologist",
        status: "Available",
        onCall: "In House",
        experience: "16 yrs",
        qualifications: "MD, DNB (Cardiology)"
      },
      {
        id: "s-mumbai-202",
        name: "Dr. Anita Nair",
        specialty: "Pulmonologist",
        status: "Available",
        onCall: "In House",
        experience: "13 yrs",
        qualifications: "MD (Pulmonary Medicine)"
      },
      {
        id: "s-mumbai-203",
        name: "Dr. Ketan Mehta",
        specialty: "Orthopedic",
        status: "Available",
        onCall: "On Call",
        experience: "18 yrs",
        qualifications: "MS (Ortho), Fellowship in Trauma"
      }
    ],
    facilities: [
      { id: "f1", name: "ICU", available: true, description: "Multi-disciplinary Critical Care & Neuro ICU" },
      { id: "f2", name: "Ventilator", available: true, description: "Dedicated pediatric & adult intensive ventilators" },
      { id: "f3", name: "Emergency / Trauma Care", available: true, description: "Full-spectrum trauma resuscitation center" },
      { id: "f4", name: "Operation Theatre", available: true, description: "Emergency cardiac & neuro OT suites" },
      { id: "f5", name: "Blood Bank", available: true, description: "Full component separation and apheresis" },
      { id: "f6", name: "CT Scan", available: true, description: "Dual Source 128-slice CT" },
      { id: "f7", name: "MRI", available: true, description: "3T MRI scanner" },
      { id: "f8", name: "Pharmacy", available: true, description: "24/7 trauma emergency dispensary" },
      { id: "f9", name: "Ambulance", available: true, description: "GPS-equipped mobile ICU ambulance" }
    ],
    insurance: ["Private Insurance", "Cashless Insurance", "Ayushman Bharat"],
    estimatedCost: {
      budgetTier: "₹10,000–₹20,000/day",
      generalBed: "₹5,800/day",
      icu: "₹15,500/day",
      consultation: "₹1,400",
      emergencyConsultation: "₹2,000",
      dailyRange: "₹14,000–₹20,000/day"
    },
    lastVerified: "Verified 6 min ago",
    lastVerifiedMinutes: 6,
    phone: "+91 22 4269 6969",
    emergencyHelpline: "+91 22 4269 9999",
    ambulanceContact: "+91 22 4269 9108",
    coordinates: { lat: 19.1311, lng: 72.8258 }
  }
];

export const EMERGENCY_TYPES = [
  "Accident / Trauma",
  "Breathing Problem",
  "Cardiac Emergency",
  "Stroke / Neurological",
  "Severe Infection",
  "Pregnancy / Maternity",
  "Pediatric Emergency",
  "Other"
];

export const FACILITY_OPTIONS = [
  { id: "General Bed", label: "General Bed", desc: "Monitored inpatient hospital bed" },
  { id: "ICU", label: "ICU", desc: "Intensive Care Unit with critical monitoring" },
  { id: "Ventilator", label: "Ventilator", desc: "Mechanical invasive/non-invasive respiratory support" },
  { id: "Emergency / Trauma Care", label: "Emergency / Trauma Care", desc: "24/7 dedicated acute resuscitation unit" },
  { id: "Operation Theatre", label: "Operation Theatre", desc: "Emergency surgical suite availability" },
  { id: "Blood Bank", label: "Blood Bank", desc: "Immediate component & whole blood access" }
];

export const SPECIALIST_OPTIONS = [
  "No specific specialist",
  "Cardiologist",
  "Neurologist",
  "Neurosurgeon",
  "Pulmonologist",
  "Orthopedic",
  "General Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Other"
];

export const BUDGET_TIERS = [
  { id: "any", label: "Any Budget", min: 0, max: 999999 },
  { id: "₹0–₹5,000/day", label: "₹0–₹5,000/day", min: 0, max: 5000 },
  { id: "₹5,000–₹10,000/day", label: "₹5,000–₹10,000/day", min: 5000, max: 10000 },
  { id: "₹10,000–₹20,000/day", label: "₹10,000–₹20,000/day", min: 10000, max: 20000 },
  { id: "₹20,000+/day", label: "₹20,000+/day", min: 20000, max: 999999 }
];

export const INSURANCE_OPTIONS = [
  "No insurance",
  "Private Insurance",
  "Ayushman Bharat",
  "Government Scheme",
  "Other"
];
