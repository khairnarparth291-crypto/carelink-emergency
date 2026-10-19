import mongoose from "mongoose";

const bedSubSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      default: 0,
      min: [0, "Total capacity cannot be negative"]
    },
    occupied: {
      type: Number,
      default: 0,
      min: [0, "Occupied capacity cannot be negative"]
    },
    available: {
      type: Number,
      default: 0,
      min: [0, "Available capacity cannot be negative"]
    }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      unique: true
    },
    normalBeds: {
      type: bedSubSchema,
      default: () => ({ total: 40, occupied: 18, available: 22 })
    },
    icuBeds: {
      type: bedSubSchema,
      default: () => ({ total: 10, occupied: 7, available: 3 })
    },
    ventilators: {
      type: bedSubSchema,
      default: () => ({ total: 5, occupied: 3, available: 2 })
    },
    emergencyBeds: {
      type: bedSubSchema,
      default: () => ({ total: 8, occupied: 4, available: 4 })
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Helper to sanitize and calculate available capacity
function calculateBedCategory(bed) {
  if (!bed) return { total: 0, occupied: 0, available: 0 };
  const total = Math.max(0, Number(bed.total) || 0);
  // Prevent occupied from becoming greater than total
  const occupied = Math.min(total, Math.max(0, Number(bed.occupied) || 0));
  const available = Math.max(0, total - occupied);
  return { total, occupied, available };
}

// Pre-save hook to calculate available capacities & ensure occupied <= total
availabilitySchema.pre("save", function (next) {
  this.normalBeds = calculateBedCategory(this.normalBeds);
  this.icuBeds = calculateBedCategory(this.icuBeds);
  this.ventilators = calculateBedCategory(this.ventilators);
  this.emergencyBeds = calculateBedCategory(this.emergencyBeds);
  this.lastUpdated = new Date();
  next();
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
