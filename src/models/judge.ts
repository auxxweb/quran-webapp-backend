import mongoose, { Document } from "mongoose";

interface Judge extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  image: string;
  zone: any;
  isBlocked: boolean;
  isDeleted: boolean;
  isMain: boolean;
}

const judgeSchema = new mongoose.Schema<Judge>(
  {
    name: {
      type: String,
      required: true,
    },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    email: {
      required: true,
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMain: {
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

const Judge = mongoose.model<Judge>("Judge", judgeSchema);
export default Judge;
