import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorRole: {
      type: String,
      default: "User",
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      default: "General",
    },
    entityId: {
      type: String,
      default: null,
    },
    targetResource: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    changes: {
      type: Object,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
