import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    threat: { type: mongoose.Schema.Types.ObjectId, ref: "Threat", required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

alertSchema.index({ organization: 1, threat: 1 }, { unique: true });

export const Alert = mongoose.model("Alert", alertSchema);