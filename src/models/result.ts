import mongoose, { Document } from "mongoose";

interface Result extends Document {
  zone: any;
  participant_id: any;
  startTime: any;
  endTime: any;
  results: any;
  isDeleted: boolean;
}

const resultSchema = new mongoose.Schema<Result>(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    participant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
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
