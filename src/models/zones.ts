import mongoose, { Document } from "mongoose";

interface Zone extends Document {
  name: string;
  description: string;
  image: string;
  url: string;
  isDeleted: boolean;
}

const zoneSchema = new mongoose.Schema<Zone>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      required: true,
      type: String,
    },
    image: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Zone = mongoose.model<Zone>("Zone", zoneSchema);
export default Zone;
