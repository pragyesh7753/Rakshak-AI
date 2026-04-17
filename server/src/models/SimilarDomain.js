import mongoose from "mongoose";

const similarDomainSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    domainName: { type: String, required: true, trim: true },
    similarityScore: { type: Number, min: 0, max: 1, default: 0 },
    registrationDate: { type: Date },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export const SimilarDomain = mongoose.model("SimilarDomain", similarDomainSchema);