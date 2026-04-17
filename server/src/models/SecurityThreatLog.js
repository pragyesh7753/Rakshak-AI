import mongoose from "mongoose";

const securityThreatLogSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      default: null,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    ip: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    risk: { type: String, default: "Low" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

securityThreatLogSchema.index({ organization: 1, timestamp: -1 });

export const SecurityThreatLog = mongoose.model("SecurityThreatLog", securityThreatLogSchema);