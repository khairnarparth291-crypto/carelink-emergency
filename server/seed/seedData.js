import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
import Facility from "../models/Facility.js";
import Cost from "../models/Cost.js";
import EmergencyRequest from "../models/EmergencyRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/carelink_emergency";

export const seedDatabase = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to seed: Database seeding is strictly disabled in production (NODE_ENV=production).");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carelink_emergency";
  const isLocal = uri.includes("127.0.0.1") || uri.includes("localhost");
  if (!isLocal || uri.includes("mongodb+srv://")) {
    console.error("❌ Refusing to seed: Target database is not a local development instance. Never clear or seed a remote or Atlas database.");
    process.exit(1);
  }

  const allowReset = process.env.ALLOW_DATABASE_RESET === "true" || process.argv.includes("--confirm-reset");
  if (!allowReset) {
    console.error("❌ Destructive seed halted: Clearing the database requires explicit opt-in.");
    console.error("To proceed with clearing local development data, set ALLOW_DATABASE_RESET=true or pass --confirm-reset.");
    process.exit(1);
  }

  try {
    console.log("Connecting to local MongoDB for seeding...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for seeding.");

    // Clear existing collections
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Availability.deleteMany({}),
      Doctor.deleteMany({}),
      Facility.deleteMany({}),
      Cost.deleteMany({}),
      EmergencyRequest.deleteMany({})
    ]);

    console.log("Existing collections cleared.");

    // 1. Create Demo Hospital Users
    console.log("Seeding Hospital Users...");
    const demoPassword = process.env.DEMO_HOSPITAL_PASSWORD;
    if (!demoPassword || demoPassword.length < 6) {
      console.error("❌ DEMO_HOSPITAL_PASSWORD environment variable must be set (min 6 characters) to seed demo users.");
      process.exit(1);
    }

    const demoUser = await User.create({
      name: "Care Hospital Operations Desk",
      email: "demo@carehospital.com",
      password: demoPassword, // Will be hashed by User pre-save hook
      role: "hospital"
    });

    const apolloUser = await User.create({
      name: "Apollo Care Triage Admin",
      email: "apollo@carehospital.com",
      password: demoPassword,
      role: "hospital"
    });

    const rubyUser = await User.create({
      name: "Ruby Metro Emergency Desk",
      email: "ruby@carehospital.com",
      password: demoPassword,
      role: "hospital"
    });

    // 2. Create 3 DEMO Pune Hospitals
    console.log("Seeding Hospitals...");
    const careHospital = await Hospital.create({
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
      lastVerified: "Verified 2 min ago",
      readinessStatus: "READY",
      totalBeds: 120,
      userId: demoUser._id
    });

    demoUser.hospitalId = careHospital._id;
    await demoUser.save();

    const apolloHospital = await Hospital.create({
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
      userId: apolloUser._id
    });

    apolloUser.hospitalId = apolloHospital._id;
    await apolloUser.save();

    const rubyHospital = await Hospital.create({
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
      userId: rubyUser._id
    });

    rubyUser.hospitalId = rubyHospital._id;
    await rubyUser.save();

    const lilavatiHospital = await Hospital.create({
      name: "Lilavati Hospital & Research Centre — Mumbai",
      address: "A-791, Bandra Reclamation, Bandra West",
      city: "Mumbai",
      phone: "+91 22 2675 1000",
      emergencyPhone: "+91 22 2656 8000",
      emergencyAvailable: true,
      description:
        "Premier quaternary care multi-speciality center in Bandra with a dedicated 24/7 cardiac ICU and acute trauma response.",
      latitude: 19.0518,
      longitude: 72.8295,
      lastVerified: "Verified 3 min ago",
      readinessStatus: "READY",
      totalBeds: 320
    });

    const kokilabenHospital = await Hospital.create({
      name: "Kokilaben Metro Multispeciality Hospital — Mumbai",
      address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West",
      city: "Mumbai",
      phone: "+91 22 4269 6969",
      emergencyPhone: "+91 22 4269 9999",
      emergencyAvailable: true,
      description:
        "Full-fledged Level-1 trauma center featuring state-of-the-art robotic surgery, stroke care, and emergency pediatric ICU.",
      latitude: 19.1314,
      longitude: 72.8252,
      lastVerified: "Verified 6 min ago",
      readinessStatus: "READY",
      totalBeds: 450
    });

    // 3. Seed Availability Records
    console.log("Seeding Availability...");
    await Availability.create([
      {
        hospitalId: careHospital._id,
        normalBeds: { total: 40, occupied: 18, available: 22 },
        icuBeds: { total: 10, occupied: 7, available: 3 },
        ventilators: { total: 5, occupied: 3, available: 2 },
        emergencyBeds: { total: 8, occupied: 4, available: 4 }
      },
      {
        hospitalId: apolloHospital._id,
        normalBeds: { total: 60, occupied: 45, available: 15 },
        icuBeds: { total: 16, occupied: 11, available: 5 },
        ventilators: { total: 8, occupied: 5, available: 3 },
        emergencyBeds: { total: 12, occupied: 8, available: 4 }
      },
      {
        hospitalId: rubyHospital._id,
        normalBeds: { total: 35, occupied: 28, available: 7 },
        icuBeds: { total: 8, occupied: 7, available: 1 },
        ventilators: { total: 4, occupied: 3, available: 1 },
        emergencyBeds: { total: 6, occupied: 4, available: 2 }
      },
      {
        hospitalId: lilavatiHospital._id,
        normalBeds: { total: 120, occupied: 96, available: 24 },
        icuBeds: { total: 30, occupied: 22, available: 8 },
        ventilators: { total: 15, occupied: 10, available: 5 },
        emergencyBeds: { total: 20, occupied: 14, available: 6 }
      },
      {
        hospitalId: kokilabenHospital._id,
        normalBeds: { total: 180, occupied: 150, available: 30 },
        icuBeds: { total: 45, occupied: 35, available: 10 },
        ventilators: { total: 20, occupied: 14, available: 6 },
        emergencyBeds: { total: 25, occupied: 17, available: 8 }
      }
    ]);

    // 4. Seed Doctors Roster
    console.log("Seeding Doctors...");
    await Doctor.create([
      // Care Hospital Pune
      {
        hospitalId: careHospital._id,
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
        hospitalId: careHospital._id,
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
        hospitalId: careHospital._id,
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
        hospitalId: careHospital._id,
        name: "Dr. Sunil Deshmukh",
        specialization: "General Surgeon",
        department: "Acute Trauma Surgery",
        qualification: "MBBS, MS (Gen Surgery), FAIS",
        experience: "16 years experience",
        status: "ON_DUTY",
        workingHours: "10 AM – 8 PM",
        phone: "+91 98230 44567"
      },

      // Apollo Care Hospital
      {
        hospitalId: apolloHospital._id,
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
        hospitalId: apolloHospital._id,
        name: "Dr. Priya Nair",
        specialization: "Pediatrician",
        department: "NICU / PICU Department",
        qualification: "MBBS, MD (Pediatrics)",
        experience: "10 years experience",
        status: "ON_DUTY",
        workingHours: "8 AM – 8 PM",
        phone: "+91 98230 88991"
      },

      // Ruby Metro Hospital
      {
        hospitalId: rubyHospital._id,
        name: "Dr. Santosh Kulkarni",
        specialization: "Orthopedic",
        department: "Orthopedic & Poly-Trauma",
        qualification: "MBBS, MS (Ortho)",
        experience: "14 years experience",
        status: "ON_DUTY",
        workingHours: "8 AM – 8 PM",
        phone: "+91 98230 77665"
      },
      {
        hospitalId: rubyHospital._id,
        name: "Dr. Amitava Roy",
        specialization: "Neurologist",
        department: "Neurology & Stroke Bay",
        qualification: "MBBS, DM (Neurology)",
        experience: "13 years experience",
        status: "ON_CALL",
        workingHours: "24/7 Emergency On-Call",
        phone: "+91 98230 77666"
      },

      // Lilavati Hospital Mumbai
      {
        hospitalId: lilavatiHospital._id,
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
        hospitalId: lilavatiHospital._id,
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
        hospitalId: lilavatiHospital._id,
        name: "Dr. Amit Shah",
        specialization: "General Surgeon",
        department: "Emergency Surgical Care",
        qualification: "MBBS, MS, MCh",
        experience: "17 years experience",
        status: "ON_DUTY",
        workingHours: "9 AM – 9 PM",
        phone: "+91 22 2675 1003"
      },

      // Kokilaben Metro Hospital Mumbai
      {
        hospitalId: kokilabenHospital._id,
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
        hospitalId: kokilabenHospital._id,
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
        hospitalId: kokilabenHospital._id,
        name: "Dr. Ketan Mehta",
        specialization: "Orthopedic",
        department: "Orthopedic & Trauma Care",
        qualification: "MS (Ortho), Fellowship in Trauma",
        experience: "18 years experience",
        status: "ON_CALL",
        workingHours: "24/7 Emergency On-Call",
        phone: "+91 22 4269 6903"
      }
    ]);

    // 5. Seed Facilities
    console.log("Seeding Facilities...");
    await Facility.create([
      {
        hospitalId: careHospital._id,
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
      },
      {
        hospitalId: apolloHospital._id,
        emergency: { available: true, status: "Available", details: "Dedicated emergency resuscitation zone" },
        icu: { available: true, status: "Available", details: "16-bed advanced ICU with isolation suites" },
        ventilator: { available: true, status: "Available", details: "8 advanced mechanical ventilators" },
        operationTheatre: { available: true, status: "Available", details: "4 state-of-the-art OT suites" },
        bloodBank: { available: true, status: "Available", details: "Full component and platelet stock" },
        ctScan: { available: true, status: "Available", details: "Rapid scan emergency CT scanner" },
        mri: { available: true, status: "Available", details: "Diagnostic MRI operational 24/7" },
        pharmacy: { available: true, status: "Available", details: "Emergency medicines always stocked" },
        ambulance: { available: true, status: "Available", details: "3 GPS-enabled ambulances" },
        dialysis: { available: true, status: "Available", details: "6 hemodialysis stations" },
        nicu: { available: true, status: "Available", details: "Level-3 advanced NICU" },
        picu: { available: true, status: "Available", details: "6 pediatric critical beds" }
      },
      {
        hospitalId: rubyHospital._id,
        emergency: { available: true, status: "Available", details: "Casualty and triage assessment" },
        icu: { available: true, status: "Limited", details: "8 ICU beds running near capacity" },
        ventilator: { available: true, status: "Limited", details: "4 ventilators with 1 currently free" },
        operationTheatre: { available: true, status: "Available", details: "2 operational emergency rooms" },
        bloodBank: { available: true, status: "Available", details: "Direct blood bank linkage" },
        ctScan: { available: true, status: "Available", details: "Emergency diagnostic CT" },
        mri: { available: false, status: "Unavailable", details: "Scheduled maintenance until tomorrow" },
        pharmacy: { available: true, status: "Available", details: "24/7 casualty counter" },
        ambulance: { available: true, status: "Available", details: "1 ambulance currently deployed" },
        dialysis: { available: true, status: "Available", details: "Emergency dialysis ward" },
        nicu: { available: false, status: "Unavailable", details: "No neonatal ward" },
        picu: { available: false, status: "Unavailable", details: "No pediatric ICU" }
      }
    ]);

    // 6. Seed Costs
    console.log("Seeding Costs & Insurance...");
    await Cost.create([
      {
        hospitalId: careHospital._id,
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
      },
      {
        hospitalId: apolloHospital._id,
        consultation: 1000,
        emergencyVisit: 1500,
        icuPerDay: 11000,
        normalBedPerDay: 4200,
        ventilatorPerDay: 5500,
        surgeryStarting: 22000,
        minEstimatedCost: 7000,
        maxEstimatedCost: 15000,
        insuranceAccepted: [
          "Private Insurance",
          "Cashless Insurance",
          "Corporate Insurance"
        ],
        governmentSchemes: []
      },
      {
        hospitalId: rubyHospital._id,
        consultation: 600,
        emergencyVisit: 900,
        icuPerDay: 6500,
        normalBedPerDay: 2800,
        ventilatorPerDay: 3500,
        surgeryStarting: 15000,
        minEstimatedCost: 4000,
        maxEstimatedCost: 8000,
        insuranceAccepted: [
          "Private Insurance",
          "Cashless Insurance",
          "Ayushman Bharat",
          "Government Schemes"
        ],
        governmentSchemes: ["Ayushman Bharat PMJAY", "MJPJAY Maharashtra"]
      }
    ]);

    // 7. Seed Emergency Requests
    console.log("Seeding Emergency Requests...");
    await EmergencyRequest.create([
      {
        patientName: "Patient #1024",
        patientAge: 45,
        patientGender: "Male",
        emergencyType: "Cardiac Emergency",
        requiredFacility: ["ICU", "Cardiologist", "Emergency Care"],
        requiredSpecialist: "Cardiologist",
        requiredBedType: "ICU",
        hospitalId: careHospital._id,
        status: "PENDING",
        message: "Crushing chest pain radiating to left arm, acute onset 30 mins ago",
        contactPhone: "+91 98220 99881",
        location: "Pune, Shivajinagar",
        estimatedArrival: "12 min",
        budget: "₹5,000–₹10,000/day",
        insurance: "Private Insurance"
      },
      {
        patientName: "Patient #1025",
        patientAge: 28,
        patientGender: "Female",
        emergencyType: "Severe Road Trauma",
        requiredFacility: ["Emergency Care", "Operation Theatre", "Blood Bank", "CT Scan"],
        requiredSpecialist: "General Surgeon",
        requiredBedType: "Emergency",
        hospitalId: careHospital._id,
        status: "PENDING",
        message: "High-speed vehicular accident on Pune bypass, suspected pelvic trauma",
        contactPhone: "+91 99999 00002",
        location: "Pune, Deccan Gymkhana",
        estimatedArrival: "8 min",
        budget: "Cashless / Insurance",
        insurance: "Cashless Insurance"
      },
      {
        patientName: "Patient #1022",
        patientAge: 67,
        patientGender: "Male",
        emergencyType: "Acute Respiratory Failure",
        requiredFacility: ["ICU", "Ventilator", "Pulmonologist"],
        requiredSpecialist: "Pulmonologist",
        requiredBedType: "ICU",
        hospitalId: careHospital._id,
        status: "ACCEPTED",
        message: "COPD exacerbation, severe tachypnea, SpO2 78%",
        rejectionReason: null,
        contactPhone: "+91 99999 00003",
        location: "Pune, Baner",
        estimatedArrival: "19 min",
        budget: "₹10,000+/day",
        insurance: "Ayushman Bharat"
      },
      {
        patientName: "Patient #1015",
        patientAge: 72,
        patientGender: "Female",
        emergencyType: "Septic Shock / Dialysis Needed",
        requiredFacility: ["ICU", "Dialysis", "Ventilator"],
        requiredSpecialist: "Nephrologist",
        requiredBedType: "ICU",
        hospitalId: careHospital._id,
        status: "REJECTED",
        rejectionReason: "ICU unavailable — all isolation bays occupied",
        contactPhone: "+91 99999 00004",
        location: "Pune, Hadapsar",
        estimatedArrival: "35 min",
        budget: "Government Schemes",
        insurance: "Government Schemes"
      }
    ]);

    console.log("==================================================");
    console.log("✅ SEEDING COMPLETE: Demo Pune Hospital Database Initialized");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

// Execute if run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}

export default seedDatabase;
