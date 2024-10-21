import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import Admin from "../../models/admin";
import Participant from "../../models/participant";
import Judge from "../../models/judge";
import Zone from "../../models/zones";

// PATCH ||  update admin password details

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, password } = req.body;

    const admin = req.admin;
    if (!admin) {
      res.status(400);
      throw new Error("admin not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, admin?.password ?? "");

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

export const getDashboardDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const participants = await Participant.countDocuments({ isDeleted: false });
    const judges = await Judge.countDocuments({ isDeleted: false });
    const zones = await Zone.countDocuments({ isDeleted: false });

    const zoneBasedParticipants = await Zone.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $lookup: {
          from: "participants",
          localField: "_id",
          foreignField: "zone",
          as: "participants",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          count: {
            $size: {
              $filter: {
                input: "$participants",
                as: "participant",
                cond: { $eq: ["$$participant.isDeleted", false] },
              },
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          label: "$name",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      data: {
        participants,
        judges,
        zones,
        zoneBasedParticipants:
          zoneBasedParticipants.length === 0 ? [] : zoneBasedParticipants,
      },
      success: true,
      msg: `admin's dashboard details fetched successfully `,
    });
  }
);
