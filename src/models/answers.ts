const mongoose = require("mongoose");

const answersSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    result_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
      required: true,
    },
    judge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Judge",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("answers", answersSchema);
