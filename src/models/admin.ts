import mongoose, { Document } from "mongoose";

interface Admin extends Document {
  name: string;
  password: string;
  email: string;
  isDeleted: boolean;
}

const adminSchema = new mongoose.Schema<Admin>(
  {
    name: {
      type: String,
      required: false,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model<Admin>("Admin", adminSchema);
export default Admin;
