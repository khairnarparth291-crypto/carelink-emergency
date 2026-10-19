import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      default: "Pune"
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    emergencyPhone: {
      type: String,
      trim: true
    },
    emergencyAvailable: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true
    },
    latitude: {
      type: Number,
      default: 18.5204
    },
    longitude: {
      type: Number,
      default: 73.8567
    },
    lastVerified: {
      type: String,
      default: "Just now"
    },
    readinessStatus: {
      type: String,
      enum: ["READY", "LIMITED", "NOT_READY"],
      default: "READY"
    },
    totalBeds: {
      type: Number,
      default: 100
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    statusReason: {
      type: String,
      default: null
    },
    deactivatedAt: {
      type: Date,
      default: null
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
