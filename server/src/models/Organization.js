import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    orgName: { type: String, required: true, trim: true },
    sector: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);