const mongoose = require("mongoose");

const answersSchema = new mongoose.Schema(
  {
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    result_id: { type: mongoose.Schema.Types.ObjectId, ref: "Result" },
    judge_id: { type: mongoose.Schema.Types.ObjectId, ref: "Judge" },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    score: {
      type: Number,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("answers", answersSchema);
