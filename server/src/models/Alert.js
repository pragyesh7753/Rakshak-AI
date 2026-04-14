import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    threat: { type: mongoose.Schema.Types.ObjectId, ref: "Threat", required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
    priority: {
      type: String,
      enum: ["medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    routeChannel: {
      type: String,
      enum: ["dashboard-digest", "analyst-review", "immediate-response"],
      default: "dashboard-digest",
    },
    routeReason: { type: String, default: "" },
    routedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

alertSchema.index({ organization: 1, threat: 1 }, { unique: true });

export const Alert = mongoose.model("Alert", alertSchema);