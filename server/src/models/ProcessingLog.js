import mongoose from "mongoose";

const processingLogSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      default: null,
    },
    jobType: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

processingLogSchema.index({ organization: 1, createdAt: -1 });

export const ProcessingLog = mongoose.model("ProcessingLog", processingLogSchema);