import mongoose from "mongoose";

const securityThreatLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    ip: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    risk: { type: String, default: "Low" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export const SecurityThreatLog = mongoose.model("SecurityThreatLog", securityThreatLogSchema);