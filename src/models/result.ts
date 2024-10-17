import mongoose, { Document } from "mongoose";

interface Result extends Document {
  zone: any;
  participant: any;
  startTime: any;
  endTime: any;
  results: any;
  isDeleted: boolean;
}

const resultSchema = new mongoose.Schema<Result>(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },

    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    results: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        startTime: {
          type: Date,
        },
        endTime: {
          type: Date,
        },
        responses: [
          {
            judge: { type: mongoose.Schema.Types.ObjectId, ref: "Judge" },
            score: {
              type: Number,
            },
            answer: {
              type: String,
            },
          },
        ],
      },
    ],
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
