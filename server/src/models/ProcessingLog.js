import mongoose from "mongoose";

const processingLogSchema = new mongoose.Schema(
  {
    jobType: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const ProcessingLog = mongoose.model("ProcessingLog", processingLogSchema);