import mongoose, { Document } from "mongoose";

interface Result extends Document {
  zone: any;
  participant_id: any;
  bundle_id: any;
  startTime: any;
  endTime: any;
  results: any;
  currentQuestion: string;
  isDeleted: boolean;
  isCompleted: boolean;
}

const resultSchema = new mongoose.Schema<Result>(
  {
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    participant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    bundle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    currentQuestion: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Result = mongoose.model<Result>("Result", resultSchema);
export default Result;
