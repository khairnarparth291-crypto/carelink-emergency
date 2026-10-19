import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: true
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    targetEntity: {
      type: String,
      required: true,
      trim: true
    },
    targetId: {
      type: String,
      default: null,
      trim: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetEntity: 1, targetId: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
