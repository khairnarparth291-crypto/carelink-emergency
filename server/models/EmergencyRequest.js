import mongoose from "mongoose";

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true
    },
    patientAge: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"]
    },
    patientGender: {
      type: String,
      default: "Unspecified"
    },
    emergencyType: {
      type: String,
      required: [true, "Emergency type is required"],
      trim: true
    },
    requiredFacility: {
      type: [String],
      default: []
    },
    requiredSpecialist: {
      type: String,
      trim: true
    },
    reportedComplaint: {
      type: String,
      trim: true,
      default: null
    },
    suggestedSpecialist: {
      type: String,
      trim: true,
      default: null
    },
    requiredBedType: {
      type: String,
      default: "Normal"
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },
    message: {
      type: String,
      trim: true
    },
    rejectionReason: {
      type: String,
      default: null
    },
    responseNote: {
      type: String,
      trim: true,
      default: null
    },
    responseTimestamp: {
      type: Date,
      default: null
    },
    hospitalResponse: {
      hospitalId: {
        type: mongoose.Schema.Types.Mixed,
        ref: "Hospital"
      },
      hospitalName: {
        type: String,
        trim: true
      },
      hospitalPhone: {
        type: String,
        trim: true
      },
      hospitalEmergencyPhone: {
        type: String,
        trim: true
      },
      hospitalAddress: {
        type: String,
        trim: true
      },
      status: {
        type: String,
        enum: ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]
      },
      responseStatus: {
        type: String,
        enum: ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]
      },
      rejectionReason: {
        type: String,
        default: null
      },
      timestamp: {
        type: Date
      },
      note: {
        type: String,
        trim: true
      }
    },
    hospitalResponses: [
      {
        hospitalId: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Hospital",
          required: true
        },
        hospitalName: {
          type: String,
          trim: true
        },
        hospitalPhone: {
          type: String,
          trim: true
        },
        hospitalEmergencyPhone: {
          type: String,
          trim: true
        },
        hospitalAddress: {
          type: String,
          trim: true
        },
        responseStatus: {
          type: String,
          enum: ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED"],
          default: "PENDING"
        },
        responseNote: {
          type: String,
          trim: true,
          default: null
        },
        rejectionReason: {
          type: String,
          trim: true,
          default: null
        },
        responseTimestamp: {
          type: Date,
          default: null
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    contactPhone: {
      type: String,
      trim: true
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    estimatedArrival: {
      type: String,
      default: "15 min"
    },
    budget: {
      type: String
    },
    insurance: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const EmergencyRequest = mongoose.model("EmergencyRequest", emergencyRequestSchema);

export default EmergencyRequest;
