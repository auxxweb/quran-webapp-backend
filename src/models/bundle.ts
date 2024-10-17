import mongoose, { Document } from "mongoose";

interface Bundle extends Document {
  title: string;
  questions: any;
  bundleId: string;
  isDeleted: boolean;
}

const bundleSchema = new mongoose.Schema<Bundle>(
  {
    title: {
      type: String,
      required: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    bundleId: {
      required: true,
      type: String,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Bundle = mongoose.model<Bundle>("Bundle", bundleSchema);
export default Bundle;
