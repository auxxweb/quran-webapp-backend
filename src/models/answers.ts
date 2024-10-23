import mongoose from 'mongoose'

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
    },
    score: {
      type: Number,
    },
    answer: {
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
  {
    timestamps: true,
  }
);

const Answer = mongoose.model("answers", answersSchema);
export default Answer
