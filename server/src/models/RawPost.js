import mongoose from "mongoose";

const rawPostSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, default: "reddit" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    url: { type: String, required: true, unique: true, index: true },
    author: { type: String, trim: true },
    postedAt: { type: Date },
    keywordScore: { type: Number, default: 0 },
    processed: { type: Boolean, default: false, index: true },
    threatScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const RawPost = mongoose.model("RawPost", rawPostSchema);