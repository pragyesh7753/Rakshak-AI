import mongoose from "mongoose";

const emailIntelligenceResultSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    organizationAlias: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    recipient: {
      type: String,
      default: "",
      trim: true,
      maxlength: 320,
    },
    inboundSubject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
    },
    originalSender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    originalSubject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
    },
    cleanContent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 16000,
    },
    extractedLinks: {
      type: [String],
      default: [],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    threatType: {
      type: String,
      enum: ["Phishing", "Impersonation", "Safe", "Suspicious"],
      default: "Suspicious",
      index: true,
    },
    flags: {
      type: [String],
      default: [],
    },
    analysis: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    recommendedAction: {
      type: String,
      enum: ["Allow", "Flag", "Block"],
      default: "Flag",
      index: true,
    },
    signalBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

emailIntelligenceResultSchema.index({ orgId: 1, createdAt: -1 });
emailIntelligenceResultSchema.index({ orgId: 1, riskScore: -1, createdAt: -1 });

export const EmailIntelligenceResult = mongoose.model(
  "EmailIntelligenceResult",
  emailIntelligenceResultSchema
);
