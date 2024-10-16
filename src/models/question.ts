import mongoose, { Document } from "mongoose";

interface Question extends Document {
  question: string;
  answer: string;
  questionId: string;
  isDeleted: boolean;
}

const questionSchema = new mongoose.Schema<Question>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      required: true,
      type: String,
    },
    questionId: {
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

const Question = mongoose.model<Question>("Question", questionSchema);
export default Question;
