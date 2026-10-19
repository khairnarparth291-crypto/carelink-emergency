import mongoose from "mongoose";

const costSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      unique: true
    },
    consultation: {
      type: Number,
      default: 800,
      min: [0, "Charge cannot be negative"]
    },
    emergencyVisit: {
      type: Number,
      default: 1200,
      min: [0, "Charge cannot be negative"]
    },
    icuPerDay: {
      type: Number,
      default: 8500,
      min: [0, "Charge cannot be negative"]
    },
    normalBedPerDay: {
      type: Number,
      default: 3500,
      min: [0, "Charge cannot be negative"]
    },
    ventilatorPerDay: {
      type: Number,
      default: 4500,
      min: [0, "Charge cannot be negative"]
    },
    surgeryStarting: {
      type: Number,
      default: 18000,
      min: [0, "Charge cannot be negative"]
    },
    minEstimatedCost: {
      type: Number,
      default: 5000,
      min: [0, "Charge cannot be negative"]
    },
    maxEstimatedCost: {
      type: Number,
      default: 10000,
      min: [0, "Charge cannot be negative"]
    },
    notes: {
      type: String,
      default: "These are estimated hospital-provided charges. Actual treatment costs may vary."
    },
    insuranceAccepted: {
      type: [String],
      default: ["Private Insurance", "Cashless Insurance", "Corporate Insurance"]
    },
    governmentSchemes: {
      type: [String],
      default: ["Ayushman Bharat", "Government Schemes"]
    }
  },
  {
    timestamps: true
  }
);

const Cost = mongoose.model("Cost", costSchema);

export default Cost;
