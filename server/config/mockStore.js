/**
 * In-Memory Database Store for CareLink Emergency
 *
 * Automatically used when a live MongoDB instance is not connected.
 * Ensures all API endpoints (Auth, Hospitals, Availability, Doctors, Facilities,
 * Costs, Emergency Requests) respond instantly with full CRUD capabilities.
 * When MongoDB connects, controllers query real MongoDB collections directly.
 */

export const mockStore = {
  users: [
    {
      _id: "670100000000000000000001",
      name: "Care Hospital Operations Desk",
      email: "demo@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000010"
    },
    {
      _id: "670100000000000000000002",
      name: "Apollo Care Triage Admin",
      email: "apollo@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000020"
    },
    {
      _id: "670100000000000000000003",
      name: "Ruby Metro Emergency Desk",
      email: "ruby@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000030"
    },
    {
      _id: "670100000000000000000004",
      name: "Lilavati Hospital Emergency Desk",
      email: "lilavati@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000040"
    },
    {
      _id: "670100000000000000000005",
      name: "Kokilaben Hospital Operations Desk",
      email: "kokilaben@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000050"
    },
    {
      _id: "670100000000000000000006",
      name: "Sahyadri Care Emergency Hub",
      email: "sahyadri@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000060"
    },
    {
      _id: "670100000000000000000007",
      name: "Bharati Medical Emergency Desk",
      email: "bharati@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000070"
    },
    {
      _id: "670100000000000000000008",
      name: "Jupiter Hospital Triage Desk",
      email: "jupiter@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000080"
    },
    {
      _id: "670100000000000000000009",
      name: "Sancheti Trauma Emergency Desk",
      email: "sancheti@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000090"
    },
    {
      _id: "67010000000000000000000a",
      name: "KEM Memorial Hospital Casualty Desk",
      email: "kem@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000100"
    },
    {
      _id: "67010000000000000000000b",
      name: "Manipal Hospital Emergency Operations",
      email: "manipal@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000110"
    },
    {
      _id: "67010000000000000000000c",
      name: "Jehangir Hospital Casualty Hub",
      email: "jehangir@carehospital.com",
      password: process.env.DEMO_HOSPITAL_PASSWORD || "",
      role: "hospital",
      hospitalId: "670100000000000000000120"
    },
    {
      _id: "670100000000000000000099",
      name: "System Administrator",
      email: "admin@carelink.org",
      password: process.env.ADMIN_PASSWORD || "",
      role: "admin",
      hospitalId: null
    }
  ],

  hospitals: [
    {
      _id: "670100000000000000000010",
      id: "670100000000000000000010",
      slug: "care-hospital-pune",
      name: "Care Hospital Pune",
      address: "Plot 14, Senapati Bapat Road, Shivajinagar",
      city: "Pune",
      phone: "+91 20 2567 8900",
      emergencyPhone: "+91 20 2567 8999",
      emergencyAvailable: true,
      description:
        "Care Hospital Pune is a leading tertiary emergency care facility equipped with Level-3 trauma bays, round-the-clock cardiac cath labs, and pediatric ICU.",
      latitude: 18.5314,
      longitude: 73.8344,
      lastVerified: "Just now",
      readinessStatus: "READY",
      totalBeds: 120,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000020",
      id: "670100000000000000000020",
      slug: "apollo-care-pune",
      name: "Apollo Care Hospital — Pune",
      address: "Plot 22, Old Mumbai-Pune Highway, Wakad",
      city: "Pune",
      phone: "+91 20 6789 1200",
      emergencyPhone: "+91 20 6789 1299",
      emergencyAvailable: true,
      description:
        "Premier multispeciality center with dedicated STEMI heart attack fast-track protocol and neuro-critical trauma resuscitation unit.",
      latitude: 18.5987,
      longitude: 73.7654,
      lastVerified: "Verified 5 min ago",
      readinessStatus: "READY",
      totalBeds: 150,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000030",
      id: "670100000000000000000030",
      slug: "ruby-metro-pune",
      name: "Ruby Metro Multispeciality Hospital",
      address: "40 Sassoon Road, Near Railway Station",
      city: "Pune",
      phone: "+91 20 2616 3399",
      emergencyPhone: "+91 20 2616 3300",
      emergencyAvailable: true,
      description:
        "Comprehensive trauma and critical emergency center serving central Pune with round-the-clock emergency surgical theatres and dialysis.",
      latitude: 18.5285,
      longitude: 73.8742,
      lastVerified: "Verified 8 min ago",
      readinessStatus: "LIMITED",
      totalBeds: 90,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000040",
      id: "670100000000000000000040",
      slug: "lilavati-care-mumbai",
      name: "Lilavati Hospital & Research Centre — Mumbai",
      address: "A-791, Bandra Reclamation, Bandra West",
      city: "Mumbai",
      phone: "+91 22 2675 1000",
      emergencyPhone: "+91 22 2675 1111",
      emergencyAvailable: true,
      description:
        "Premier multi-speciality tertiary care center in Mumbai equipped with advanced cardiac catheterization labs, critical care ICU, and round-the-clock emergency casualty triage.",
      latitude: 19.0522,
      longitude: 72.8317,
      lastVerified: "Verified 3 min ago",
      readinessStatus: "READY",
      totalBeds: 140,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000050",
      id: "670100000000000000000050",
      slug: "kokilaben-metro-mumbai",
      name: "Kokilaben Metro Multispeciality Hospital — Mumbai",
      address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
      city: "Mumbai",
      phone: "+91 22 4269 6969",
      emergencyPhone: "+91 22 4269 9999",
      emergencyAvailable: true,
      description:
        "Leading multi-speciality hospital in Mumbai with dedicated trauma resuscitation bays, neuro-critical care suites, and advanced surgical facilities.",
      latitude: 19.1311,
      longitude: 72.8258,
      lastVerified: "Verified 6 min ago",
      readinessStatus: "READY",
      totalBeds: 180,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000060",
      id: "670100000000000000000060",
      slug: "sahyadri-care-deccan",
      name: "Sahyadri Care Hospital — Deccan",
      address: "Plot 30-C, Karve Road, Deccan Gymkhana",
      city: "Pune",
      phone: "+91 20 6721 5000",
      emergencyPhone: "+91 20 6721 5100",
      emergencyAvailable: true,
      description: "State-of-the-art emergency trauma, neurological resuscitation, and critical cardiac care facility in Deccan Pune.",
      latitude: 18.5134,
      longitude: 73.8402,
      lastVerified: "Verified 4 min ago",
      readinessStatus: "READY",
      totalBeds: 110,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000070",
      id: "670100000000000000000070",
      slug: "bharati-medical-dhankawadi",
      name: "Bharati Trust Hospital & Research Centre",
      address: "Pune-Satara Road, Dhankawadi",
      city: "Pune",
      phone: "+91 20 2437 3226",
      emergencyPhone: "+91 20 2437 3222",
      emergencyAvailable: true,
      description: "Major tertiary academic hospital with Level-1 casualty infrastructure, acute burn and trauma care in southern Pune.",
      latitude: 18.4575,
      longitude: 73.8508,
      lastVerified: "Verified 7 min ago",
      readinessStatus: "READY",
      totalBeds: 200,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000080",
      id: "670100000000000000000080",
      slug: "jupiter-baner-pune",
      name: "Jupiter Premier Hospital — Baner",
      address: "Near Balewadi High Street, Baner",
      city: "Pune",
      phone: "+91 20 2799 1000",
      emergencyPhone: "+91 20 2799 1108",
      emergencyAvailable: true,
      description: "Quaternary multi-speciality healthcare center with cutting-edge emergency OT, digital cath lab, and ECMO readiness.",
      latitude: 18.5679,
      longitude: 73.7715,
      lastVerified: "Verified 2 min ago",
      readinessStatus: "READY",
      totalBeds: 160,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000090",
      id: "670100000000000000000090",
      slug: "sancheti-ortho-shivaji",
      name: "Sancheti Emergency & Trauma Hospital",
      address: "16 Shivajinagar, Near Agriculture College",
      city: "Pune",
      phone: "+91 20 2899 9999",
      emergencyPhone: "+91 20 2899 9100",
      emergencyAvailable: true,
      description: "Pioneering orthopedic and poly-trauma specialty hospital offering round-the-clock emergency bone and spine trauma management.",
      latitude: 18.5302,
      longitude: 73.8524,
      lastVerified: "Verified 10 min ago",
      readinessStatus: "LIMITED",
      totalBeds: 80,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000100",
      id: "670100000000000000000100",
      slug: "kem-charity-rasta-peth",
      name: "KEM Memorial Hospital — Rasta Peth",
      address: "489 Rasta Peth, Near Sardar Moodliar Road",
      city: "Pune",
      phone: "+91 20 6603 7300",
      emergencyPhone: "+91 20 6603 7373",
      emergencyAvailable: true,
      description: "Historic non-profit tertiary center featuring rapid response emergency casualty, nephrology dialysis, and intensive respiratory care.",
      latitude: 18.5204,
      longitude: 73.8655,
      lastVerified: "Verified 5 min ago",
      readinessStatus: "READY",
      totalBeds: 140,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000110",
      id: "670100000000000000000110",
      slug: "manipal-kharadi-pune",
      name: "Manipal Super Specialty Hospital — Kharadi",
      address: "Survey No 22/2A, Mundhwa - Kharadi Bypass",
      city: "Pune",
      phone: "+91 20 6744 5566",
      emergencyPhone: "+91 20 6744 5599",
      emergencyAvailable: true,
      description: "World-class emergency and critical care center in eastern Pune with multi-slice CT, MRI, and dedicated stroke fast-track protocols.",
      latitude: 18.5512,
      longitude: 73.9388,
      lastVerified: "Verified 3 min ago",
      readinessStatus: "READY",
      totalBeds: 150,
      createdAt: new Date().toISOString()
    },
    {
      _id: "670100000000000000000120",
      id: "670100000000000000000120",
      slug: "jehangir-station-pune",
      name: "Jehangir Hospital — Central Pune",
      address: "32 Sassoon Road, Opposite Pune Railway Station",
      city: "Pune",
      phone: "+91 20 6681 9999",
      emergencyPhone: "+91 20 6681 9900",
      emergencyAvailable: true,
      description: "Centrally located multi-specialty acute hospital providing immediate casualty resuscitation, cardiac ICU, and emergency surgery suites.",
      latitude: 18.5298,
      longitude: 73.8752,
      lastVerified: "Verified 8 min ago",
      readinessStatus: "READY",
      totalBeds: 130,
      createdAt: new Date().toISOString()
    }
  ],

  availabilities: [
    {
      _id: "670100000000000000000101",
      hospitalId: "670100000000000000000010",
      normalBeds: { total: 40, occupied: 18, available: 22 },
      icuBeds: { total: 10, occupied: 7, available: 3 },
      ventilators: { total: 5, occupied: 3, available: 2 },
      emergencyBeds: { total: 8, occupied: 4, available: 4 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000102",
      hospitalId: "670100000000000000000020",
      normalBeds: { total: 60, occupied: 45, available: 15 },
      icuBeds: { total: 16, occupied: 11, available: 5 },
      ventilators: { total: 8, occupied: 5, available: 3 },
      emergencyBeds: { total: 12, occupied: 8, available: 4 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000103",
      hospitalId: "670100000000000000000030",
      normalBeds: { total: 35, occupied: 28, available: 7 },
      icuBeds: { total: 8, occupied: 7, available: 1 },
      ventilators: { total: 4, occupied: 3, available: 1 },
      emergencyBeds: { total: 6, occupied: 4, available: 2 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000104",
      hospitalId: "670100000000000000000040",
      normalBeds: { total: 50, occupied: 28, available: 22 },
      icuBeds: { total: 15, occupied: 9, available: 6 },
      ventilators: { total: 8, occupied: 4, available: 4 },
      emergencyBeds: { total: 18, occupied: 10, available: 8 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000105",
      hospitalId: "670100000000000000000050",
      normalBeds: { total: 60, occupied: 30, available: 30 },
      icuBeds: { total: 20, occupied: 12, available: 8 },
      ventilators: { total: 10, occupied: 5, available: 5 },
      emergencyBeds: { total: 24, occupied: 14, available: 10 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000106",
      hospitalId: "670100000000000000000060",
      normalBeds: { total: 30, occupied: 21, available: 9 },
      icuBeds: { total: 8, occupied: 6, available: 2 },
      ventilators: { total: 4, occupied: 3, available: 1 },
      emergencyBeds: { total: 6, occupied: 3, available: 3 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000107",
      hospitalId: "670100000000000000000070",
      normalBeds: { total: 80, occupied: 45, available: 35 },
      icuBeds: { total: 16, occupied: 9, available: 7 },
      ventilators: { total: 8, occupied: 4, available: 4 },
      emergencyBeds: { total: 12, occupied: 4, available: 8 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000108",
      hospitalId: "670100000000000000000080",
      normalBeds: { total: 50, occupied: 34, available: 16 },
      icuBeds: { total: 12, occupied: 8, available: 4 },
      ventilators: { total: 6, occupied: 3, available: 3 },
      emergencyBeds: { total: 10, occupied: 5, available: 5 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000109",
      hospitalId: "670100000000000000000090",
      normalBeds: { total: 25, occupied: 20, available: 5 },
      icuBeds: { total: 6, occupied: 5, available: 1 },
      ventilators: { total: 4, occupied: 2, available: 2 },
      emergencyBeds: { total: 6, occupied: 4, available: 2 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000110",
      hospitalId: "670100000000000000000100",
      normalBeds: { total: 60, occupied: 38, available: 22 },
      icuBeds: { total: 12, occupied: 8, available: 4 },
      ventilators: { total: 6, occupied: 4, available: 2 },
      emergencyBeds: { total: 8, occupied: 4, available: 4 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000111",
      hospitalId: "670100000000000000000110",
      normalBeds: { total: 45, occupied: 31, available: 14 },
      icuBeds: { total: 10, occupied: 7, available: 3 },
      ventilators: { total: 5, occupied: 3, available: 2 },
      emergencyBeds: { total: 8, occupied: 4, available: 4 },
      lastUpdated: new Date().toISOString()
    },
    {
      _id: "670100000000000000000112",
      hospitalId: "670100000000000000000120",
      normalBeds: { total: 20, occupied: 18, available: 2 },
      icuBeds: { total: 10, occupied: 6, available: 4 },
      ventilators: { total: 4, occupied: 2, available: 2 },
      emergencyBeds: { total: 5, occupied: 4, available: 1 },
      lastUpdated: new Date().toISOString()
    }
  ],

  doctors: [
    {
      _id: "670100000000000000000201",
      id: "670100000000000000000201",
      hospitalId: "670100000000000000000010",
      name: "Dr. Ananya Sharma",
      specialization: "Cardiologist",
      department: "Cardiology & STEMI Unit",
      qualification: "MBBS, MD Cardiology",
      experience: "12 years experience",
      status: "ON_DUTY",
      workingHours: "8 PM – 8 AM",
      phone: "+91 98230 11234"
    },
    {
      _id: "670100000000000000000202",
      id: "670100000000000000000202",
      hospitalId: "670100000000000000000010",
      name: "Dr. Rajesh Kulkarni",
      specialization: "Pulmonologist",
      department: "Pulmonology & Respiratory Care",
      qualification: "MBBS, MD (Chest), FCCP",
      experience: "11 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 98230 22345"
    },
    {
      _id: "670100000000000000000203",
      id: "670100000000000000000203",
      hospitalId: "670100000000000000000010",
      name: "Dr. Vikram Sethi",
      specialization: "Neurosurgeon",
      department: "Neurosurgery & Stroke Bay",
      qualification: "MBBS, MS, MCh (Neurosurgery)",
      experience: "15 years experience",
      status: "ON_DUTY",
      workingHours: "9 AM – 9 PM",
      phone: "+91 98230 33456"
    },
    {
      _id: "670100000000000000000204",
      id: "670100000000000000000204",
      hospitalId: "670100000000000000000010",
      name: "Dr. Sunil Deshmukh",
      specialization: "General Surgeon",
      department: "Acute Trauma Surgery",
      qualification: "MBBS, MS (Gen Surgery), FAIS",
      experience: "16 years experience",
      status: "ON_DUTY",
      workingHours: "10 AM – 8 PM",
      phone: "+91 98230 44567"
    },
    // Apollo Care Hospital Pune (670100000000000000000020)
    {
      _id: "670100000000000000000205",
      id: "670100000000000000000205",
      hospitalId: "670100000000000000000020",
      name: "Dr. Arvind Pathak",
      specialization: "Cardiologist",
      department: "Interventional Cardiology",
      qualification: "MBBS, DM (Cardiology)",
      experience: "18 years experience",
      status: "ON_DUTY",
      workingHours: "24/7 Cath Lab Coverage",
      phone: "+91 98230 88990"
    },
    {
      _id: "670100000000000000000206",
      id: "670100000000000000000206",
      hospitalId: "670100000000000000000020",
      name: "Dr. Priya Nair",
      specialization: "Pediatrician",
      department: "NICU / PICU Department",
      qualification: "MBBS, MD (Pediatrics)",
      experience: "10 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 98230 88991"
    },
    {
      _id: "670100000000000000000207",
      id: "670100000000000000000207",
      hospitalId: "670100000000000000000020",
      name: "Dr. Neha Patwardhan",
      specialization: "Gynecologist",
      department: "Obstetrics & Gynecology",
      qualification: "MS (OBG), DNB",
      experience: "9 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 98230 88992"
    },
    // Ruby Metro Hospital Pune (670100000000000000000030)
    {
      _id: "670100000000000000000208",
      id: "670100000000000000000208",
      hospitalId: "670100000000000000000030",
      name: "Dr. Pooja Joshi",
      specialization: "Cardiologist",
      department: "Casualty Cardiology",
      qualification: "MBBS, MD Cardiology",
      experience: "10 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 98230 77667"
    },
    {
      _id: "670100000000000000000209",
      id: "670100000000000000000209",
      hospitalId: "670100000000000000000030",
      name: "Dr. Amitava Roy",
      specialization: "Neurologist",
      department: "Neurology & Stroke Bay",
      qualification: "MBBS, DM (Neurology)",
      experience: "13 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 98230 77666"
    },
    {
      _id: "670100000000000000000210",
      id: "670100000000000000000210",
      hospitalId: "670100000000000000000030",
      name: "Dr. Santosh Kulkarni",
      specialization: "Orthopedic",
      department: "Orthopedic & Poly-Trauma",
      qualification: "MBBS, MS (Ortho)",
      experience: "14 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 98230 77665"
    },
    // Lilavati Hospital Mumbai (670100000000000000000040)
    {
      _id: "670100000000000000000211",
      id: "670100000000000000000211",
      hospitalId: "670100000000000000000040",
      name: "Dr. Suresh Rao",
      specialization: "Cardiologist",
      department: "Cardiology & Critical Care",
      qualification: "MBBS, MD, DM (Cardiology)",
      experience: "19 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 22 2675 1001"
    },
    {
      _id: "670100000000000000000212",
      id: "670100000000000000000212",
      hospitalId: "670100000000000000000040",
      name: "Dr. Meera Desai",
      specialization: "Neurologist",
      department: "Neurology & Acute Stroke Center",
      qualification: "MBBS, MD, DM (Neurology)",
      experience: "15 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 22 2675 1002"
    },
    {
      _id: "670100000000000000000213",
      id: "670100000000000000000213",
      hospitalId: "670100000000000000000040",
      name: "Dr. Amit Shah",
      specialization: "General Surgeon",
      department: "Emergency Surgical Care",
      qualification: "MBBS, MS, MCh",
      experience: "17 years experience",
      status: "ON_DUTY",
      workingHours: "9 AM – 9 PM",
      phone: "+91 22 2675 1003"
    },
    // Kokilaben Metro Hospital Mumbai (670100000000000000000050)
    {
      _id: "670100000000000000000214",
      id: "670100000000000000000214",
      hospitalId: "670100000000000000000050",
      name: "Dr. Rajiv Parikh",
      specialization: "Cardiologist",
      department: "Cardiology & Cath Lab",
      qualification: "MBBS, MD, DNB (Cardiology)",
      experience: "16 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 22 4269 6901"
    },
    {
      _id: "670100000000000000000215",
      id: "670100000000000000000215",
      hospitalId: "670100000000000000000050",
      name: "Dr. Anita Nair",
      specialization: "Pulmonologist",
      department: "Pulmonary & Critical Care",
      qualification: "MBBS, MD (Pulmonary Medicine)",
      experience: "13 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 22 4269 6902"
    },
    {
      _id: "670100000000000000000216",
      id: "670100000000000000000216",
      hospitalId: "670100000000000000000050",
      name: "Dr. Ketan Mehta",
      specialization: "Orthopedic",
      department: "Orthopedic & Trauma Care",
      qualification: "MS (Ortho), Fellowship in Trauma",
      experience: "18 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 22 4269 6903"
    },
    // Sahyadri Care Hospital Pune (670100000000000000000060)
    {
      _id: "670100000000000000000217",
      id: "670100000000000000000217",
      hospitalId: "670100000000000000000060",
      name: "Dr. Milind Soman",
      specialization: "Cardiologist",
      department: "Cardiology",
      qualification: "MBBS, MD (Cardiology)",
      experience: "14 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 6721 5001"
    },
    {
      _id: "670100000000000000000218",
      id: "670100000000000000000218",
      hospitalId: "670100000000000000000060",
      name: "Dr. Rahul Shinde",
      specialization: "Orthopedic",
      department: "Trauma Care",
      qualification: "MS (Ortho)",
      experience: "12 years experience",
      status: "ON_CALL",
      workingHours: "24/7 Emergency On-Call",
      phone: "+91 20 6721 5002"
    },
    // Bharati Hospital Pune (670100000000000000000070)
    {
      _id: "670100000000000000000219",
      id: "670100000000000000000219",
      hospitalId: "670100000000000000000070",
      name: "Dr. Santosh Chavan",
      specialization: "General Surgeon",
      department: "Acute Surgery",
      qualification: "MBBS, MS",
      experience: "15 years experience",
      status: "ON_DUTY",
      workingHours: "9 AM – 9 PM",
      phone: "+91 20 2437 3230"
    },
    {
      _id: "670100000000000000000220",
      id: "670100000000000000000220",
      hospitalId: "670100000000000000000070",
      name: "Dr. Prakash Mane",
      specialization: "Pulmonologist",
      department: "Pulmonology",
      qualification: "MBBS, MD",
      experience: "11 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 2437 3231"
    },
    // Jupiter Hospital Pune (670100000000000000000080)
    {
      _id: "670100000000000000000221",
      id: "670100000000000000000221",
      hospitalId: "670100000000000000000080",
      name: "Dr. Ashish Kothari",
      specialization: "Cardiologist",
      department: "Cardiology",
      qualification: "MBBS, DM",
      experience: "16 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 2799 1001"
    },
    {
      _id: "670100000000000000000222",
      id: "670100000000000000000222",
      hospitalId: "670100000000000000000080",
      name: "Dr. Varun Agarwal",
      specialization: "Neurosurgeon",
      department: "Neurosurgery",
      qualification: "MCh Neurosurgery",
      experience: "14 years experience",
      status: "ON_DUTY",
      workingHours: "24/7 Coverage",
      phone: "+91 20 2799 1002"
    },
    // Sancheti Hospital Pune (670100000000000000000090)
    {
      _id: "670100000000000000000223",
      id: "670100000000000000000223",
      hospitalId: "670100000000000000000090",
      name: "Dr. Parag Sancheti",
      specialization: "Orthopedic",
      department: "Trauma & Orthopedics",
      qualification: "MS Ortho, MCh",
      experience: "20 years experience",
      status: "ON_DUTY",
      workingHours: "9 AM – 9 PM",
      phone: "+91 20 2899 9901"
    },
    // KEM Hospital Pune (670100000000000000000100)
    {
      _id: "670100000000000000000224",
      id: "670100000000000000000224",
      hospitalId: "670100000000000000000100",
      name: "Dr. Farokh Udwadia",
      specialization: "Pulmonologist",
      department: "Pulmonary & ICU",
      qualification: "MD, FRCP",
      experience: "25 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 6603 7301"
    },
    // Manipal Hospital Pune (670100000000000000000110)
    {
      _id: "670100000000000000000225",
      id: "670100000000000000000225",
      hospitalId: "670100000000000000000110",
      name: "Dr. Tarun Grover",
      specialization: "Cardiologist",
      department: "Cardiology",
      qualification: "MBBS, MD, DM",
      experience: "15 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 6744 5567"
    },
    {
      _id: "670100000000000000000226",
      id: "670100000000000000000226",
      hospitalId: "670100000000000000000110",
      name: "Dr. Snehal Kulkarni",
      specialization: "Neurologist",
      department: "Neurology",
      qualification: "MBBS, DM Neurology",
      experience: "13 years experience",
      status: "ON_DUTY",
      workingHours: "9 AM – 9 PM",
      phone: "+91 20 6744 5568"
    },
    // Jehangir Hospital Pune (670100000000000000000120)
    {
      _id: "670100000000000000000227",
      id: "670100000000000000000227",
      hospitalId: "670100000000000000000120",
      name: "Dr. Suhas Hardas",
      specialization: "Cardiologist",
      department: "Cardiology",
      qualification: "MBBS, DM",
      experience: "18 years experience",
      status: "ON_DUTY",
      workingHours: "8 AM – 8 PM",
      phone: "+91 20 6681 9901"
    }
  ],

  facilities: [
    {
      _id: "670100000000000000000301",
      hospitalId: "670100000000000000000010",
      emergency: { available: true, status: "Available", details: "24/7 Level-1 Trauma Bay" },
      icu: { available: true, status: "Available", details: "10-bed multi-parameter ICU" },
      ventilator: { available: true, status: "Available", details: "5 high-end invasive ventilators" },
      operationTheatre: { available: true, status: "Available", details: "3 active laminar airflow OTs" },
      bloodBank: { available: true, status: "Available", details: "Whole blood and component units stocked" },
      ctScan: { available: true, status: "Available", details: "128-slice high-speed emergency CT" },
      mri: { available: true, status: "Available", details: "3 Tesla Digital Wide-Bore MRI" },
      pharmacy: { available: true, status: "Available", details: "24/7 In-House Emergency Pharmacy" },
      ambulance: { available: true, status: "Available", details: "2 ACLS Cardiac Ambulances on standby" },
      dialysis: { available: true, status: "Limited", details: "Bedside emergency dialysis available" },
      nicu: { available: true, status: "Available", details: "Neonatal intensive care equipped" },
      picu: { available: true, status: "Limited", details: "4-bed pediatric intensive care unit" }
    }
  ],

  costs: [
    {
      _id: "670100000000000000000401",
      hospitalId: "670100000000000000000010",
      consultation: 800,
      emergencyVisit: 1200,
      icuPerDay: 8500,
      normalBedPerDay: 3500,
      ventilatorPerDay: 4500,
      surgeryStarting: 18000,
      minEstimatedCost: 5000,
      maxEstimatedCost: 10000,
      insuranceAccepted: [
        "Private Insurance",
        "Cashless Insurance",
        "Ayushman Bharat",
        "Government Schemes",
        "Corporate Insurance"
      ],
      governmentSchemes: ["Ayushman Bharat PMJAY", "MJPJAY Maharashtra"]
    }
  ],

  emergencyRequests: [
    {
      _id: "670100000000000000000501",
      id: "ER-1024",
      patientName: "Patient #1024",
      patientAge: 45,
      patientGender: "Male",
      emergencyType: "Cardiac Emergency",
      requiredFacility: ["ICU", "Cardiologist", "Emergency Care"],
      requiredSpecialist: "Cardiologist",
      requiredBedType: "ICU",
      hospitalId: "670100000000000000000010",
      status: "PENDING",
      message: "Crushing chest pain radiating to left arm, acute onset 30 mins ago",
      contactPhone: "+91 99999 00001",
      location: "Pune, Shivajinagar",
      estimatedArrival: "12 min",
      budget: "₹5,000–₹10,000/day",
      insurance: "Private Insurance",
      rejectionReason: null,
      responseNote: null,
      responseTimestamp: null,
      hospitalResponse: null,
      hospitalResponses: [
        {
          hospitalId: "670100000000000000000010",
          hospitalName: "Care Hospital Pune",
          hospitalPhone: "+91 20 2567 8900",
          hospitalEmergencyPhone: "+91 20 2567 8999",
          hospitalAddress: "Plot 14, Senapati Bapat Road, Shivajinagar, Pune",
          responseStatus: "PENDING",
          responseNote: null,
          rejectionReason: null,
          responseTimestamp: null,
          updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          hospitalId: "670100000000000000000020",
          hospitalName: "Apollo Care Hospital — Pune",
          hospitalPhone: "+91 20 6789 1200",
          hospitalEmergencyPhone: "+91 20 6789 1299",
          hospitalAddress: "Plot 22, Old Mumbai-Pune Highway, Wakad, Pune",
          responseStatus: "PENDING",
          responseNote: null,
          rejectionReason: null,
          responseTimestamp: null,
          updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      _id: "670100000000000000000502",
      id: "ER-1025",
      patientName: "Patient #1025",
      patientAge: 28,
      patientGender: "Female",
      emergencyType: "Severe Road Trauma",
      requiredFacility: ["Emergency Care", "Operation Theatre", "Blood Bank", "CT Scan"],
      requiredSpecialist: "General Surgeon",
      requiredBedType: "Emergency",
      hospitalId: "670100000000000000000010",
      status: "PENDING",
      message: "High-speed vehicular accident on Pune bypass, suspected pelvic trauma",
      contactPhone: "+91 99999 00002",
      location: "Pune, Deccan Gymkhana",
      estimatedArrival: "8 min",
      budget: "Cashless / Insurance",
      insurance: "Cashless Insurance",
      rejectionReason: null,
      responseNote: null,
      responseTimestamp: null,
      hospitalResponse: null,
      hospitalResponses: [
        {
          hospitalId: "670100000000000000000010",
          hospitalName: "Care Hospital Pune",
          hospitalPhone: "+91 20 2567 8900",
          hospitalEmergencyPhone: "+91 20 2567 8999",
          hospitalAddress: "Plot 14, Senapati Bapat Road, Shivajinagar, Pune",
          responseStatus: "PENDING",
          responseNote: null,
          rejectionReason: null,
          responseTimestamp: null,
          updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
        },
        {
          hospitalId: "670100000000000000000030",
          hospitalName: "Ruby Metro Multispeciality Hospital",
          hospitalPhone: "+91 20 2616 3399",
          hospitalEmergencyPhone: "+91 20 2616 3300",
          hospitalAddress: "40 Sassoon Road, Near Railway Station, Pune",
          responseStatus: "PENDING",
          responseNote: null,
          rejectionReason: null,
          responseTimestamp: null,
          updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
    }
  ],
  auditLogs: []
};

export default mockStore;
