import mongoose from "mongoose";

const threatSchema = new mongoose.Schema(
  {
    rawPost: { type: mongoose.Schema.Types.ObjectId, ref: "RawPost", required: true, index: true },
    threatType: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    severityScore: { type: Number, min: 0, max: 10, default: 0 },
    credibilityScore: { type: Number, min: 0, max: 10, default: 0 },
    impactLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    organizationsMentioned: { type: [String], default: [] },
    summary: { type: String, default: "" },
    aiConfidence: { type: Number, min: 0, max: 1, default: 0.5 },
  },
  { timestamps: true }
);

export const Threat = mongoose.model("Threat", threatSchema);