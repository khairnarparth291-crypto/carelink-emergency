import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"]
    },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    experience: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["ON_DUTY", "ON_CALL", "UNAVAILABLE"],
      default: "ON_DUTY"
    },
    workingHours: {
      type: String,
      default: "8 AM – 8 PM"
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
