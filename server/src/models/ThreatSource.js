import mongoose from "mongoose";

const threatSourceSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ThreatSource = mongoose.model("ThreatSource", threatSourceSchema);