import mongoose from "mongoose";

const facilityItemSchema = new mongoose.Schema(
  {
    available: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["Available", "Limited", "Unavailable"],
      default: "Available"
    },
    details: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const facilitySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      unique: true
    },
    emergency: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "24/7 Level-1 Trauma Bay" })
    },
    icu: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "Intensive Critical Care Monitoring" })
    },
    ventilator: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "Mechanical & NIV Support" })
    },
    operationTheatre: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "Laminar Airflow Emergency Suites" })
    },
    bloodBank: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "Licensed Whole Blood & Components" })
    },
    ctScan: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "128-slice high-speed emergency CT" })
    },
    mri: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "3 Tesla Wide-Bore Digital MRI" })
    },
    pharmacy: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "24/7 Emergency Medicine Counter" })
    },
    ambulance: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "ACLS Life Support Ambulances" })
    },
    dialysis: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Limited", details: "Emergency Bedside Dialysis in ICU" })
    },
    nicu: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Available", details: "Neonatal Intensive Care Unit" })
    },
    picu: {
      type: facilityItemSchema,
      default: () => ({ available: true, status: "Limited", details: "Pediatric Intensive Care Unit" })
    }
  },
  {
    timestamps: true
  }
);

const Facility = mongoose.model("Facility", facilitySchema);

export default Facility;
