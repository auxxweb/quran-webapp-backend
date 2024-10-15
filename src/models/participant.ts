import mongoose, { Document } from "mongoose";

interface Participant extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age: string;
  image: string;
  zone: any;
  isDeleted: boolean;
}

const participantSchema = new mongoose.Schema<Participant>(
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
    age: {
      type: String,
      required: true,
    },
    image: {
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

const Participant = mongoose.model<Participant>("Participant", participantSchema);
export default Participant;
