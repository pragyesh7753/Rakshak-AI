import mongoose from "mongoose";

const domainActivitySchema = new mongoose.Schema(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, ref: "SimilarDomain", required: true, index: true },
    activityType: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    severity: { type: String, default: "low" },
    isSuspicious: { type: Boolean, default: false, index: true },
    detectedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const DomainActivity = mongoose.model("DomainActivity", domainActivitySchema);