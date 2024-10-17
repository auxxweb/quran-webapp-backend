import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import Admin from "../../models/admin";

// PATCH ||  update admin password details

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, password } = req.body;
    const admin = req.admin;
    if (!admin) {
      res.status(400);
      throw new Error("admin not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      res.status(400);
      throw new Error("Incorrect Password!");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);
    const updatedAdmin = await Admin.findByIdAndUpdate(
      { _id: admin?._id },
      {
        password: hashedPassword,
      },
      { new: true }
    );
    if (!updatedAdmin) {
      res.status(400);
      throw new Error("Password updation failed");
    }

    res.status(200).json({
      success: true,
      msg: `admin's password successfully updated`,
    });
  }
);
