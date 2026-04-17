import mongoose from "mongoose";

const domainIntelligenceAlertSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DomainIntelligenceDomain",
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    flags: { type: [String], default: [] },
    lastEvaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

domainIntelligenceAlertSchema.index({ orgId: 1, createdAt: -1 });
domainIntelligenceAlertSchema.index({ domainId: 1 }, { unique: true });

export const DomainIntelligenceAlert = mongoose.model(
  "DomainIntelligenceAlert",
  domainIntelligenceAlertSchema
);
