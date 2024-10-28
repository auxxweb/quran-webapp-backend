import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Judge from "../../models/judge";
import crypto from "crypto";
import mongoose from "mongoose";
import Answer from "../../models/answers";
import Result from "../../models/result";

export const uploadJudgeDetails = asyncHandler(
  async (req: any, res: Response) => {
    const { name, email, phone, address, gender, zone, isMain } = req.body;
    const { image }: any = req?.files || {};
    const imageUrl = image && image[0]?.location;
    if (!name || !email || !phone || !address || !gender || !zone) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }

    const existJudge = await Judge.findOne({
      email,
      isDeleted: false,
      zone: new mongoose.Types.ObjectId(String(zone)),
    });

    if (existJudge) {
      res.status(400);
      throw new Error(`${email}  already exists`);
    }
    const isLiveCompetition = await Result.findOne({
      isDeleted: false,
      isCompleted: false,
      zone: new mongoose.Types.ObjectId(String(zone)),
    });

    if (isLiveCompetition) {
      res.status(400);
      throw new Error(
        `A live competition is happening for a participant; can't add a judge.`
      );
    }
    if (isMain === true || isMain === "true") {
      const mainJudge = await Judge.findOne({
        zone: new mongoose.Types.ObjectId(String(zone)),
        isMain: true,
        isDeleted: false,
      });
      if (mainJudge) {
        res.status(400);
        throw new Error(`A main judge already exists in this zone`);
      }
    }
    const plainPassword = crypto.randomBytes(4).toString("hex").slice(0, 8);
    const judge = await Judge.create({
      ...req.body,
      password: plainPassword,
      image: imageUrl && imageUrl,
    });
    if (!judge) {
      res.status(400);
      throw new Error("Judge upload failed");
    }

    res.status(201).json({
      success: true,
      msg: "Judge details successfully uploaded",
    });
  }
);

// PATCH || update Judge details
export const updateJudgeDetails = asyncHandler(
  async (req: any, res: Response) => {
    const { judgeId, email, isMain, zone } = req.body;
    const { image }: any = req.files || {};
    const imageUrl = image && image[0]?.location;
    if (!judgeId) {
      res.status(400);
      throw new Error("Judge Id  not found");
    }
    if (email) {
      const judge = await Judge.findOne({
        _id: judgeId,
        isDeleted: false,
      });
      if (!judge) {
        res.status(404);
        throw new Error("Judge not found");
      }

      if (judge.email !== email) {
        const existJudge = await Judge.findOne({
          email,
          isDeleted: false,
        });

        if (existJudge) {
          res.status(400);
          throw new Error("This email already used");
        }
      }
    }

    if ((isMain === true || isMain === "true") && zone) {
      const isLiveCompetition = await Result.findOne({
        isDeleted: false,
        isCompleted: false,
        zone: new mongoose.Types.ObjectId(String(zone)),
      });
      console.log(isLiveCompetition, "livee");

      if (isLiveCompetition) {
        res.status(400);
        throw new Error(
          `A live competition is happening for a judge; can't change.`
        );
      }
    }
    if ((isMain === true || isMain === "true") && zone) {
      await Judge.findOneAndUpdate(
        { isMain: true, isDeleted: false, _id: { $ne: judgeId } },
        { isMain: false },
        { new: true }
      );
    }

    const updatedJudge = await Judge.findOneAndUpdate(
      { _id: judgeId, isDeleted: false },
      { ...req.body, image: imageUrl && imageUrl },
      { new: true }
    );

    if (!updatedJudge) {
      res.status(400);
      throw new Error("Judge not updated");
    }

    res.status(200).json({
      success: true,
      msg: "Judge details successfully updated",
    });
  }
);

// DELETE ||  delete judge details

export const deletejudgeDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { judgeId } = req.query;

    if (!judgeId) {
      res.status(400);
      throw new Error("judgeId not found");
    }

    const existJudge = await Judge.findOne({
      _id: new mongoose.Types.ObjectId(String(judgeId)),
      isDeleted: false,
    });

    if (existJudge?.isMain === true) {
      res.status(400);
      throw new Error(`Can't delete the main judge.`);
    }

    const isInLiveCompetition = await Result.findOne({
      zone: new mongoose.Types.ObjectId(String(existJudge?.zone)),
      isCompleted: false,
      isDeleted: false,
    });

    if (isInLiveCompetition) {
      res.status(400);
      throw new Error("The judge is already in a live competition");
    }

    const judge = await Judge.findByIdAndUpdate(
      { _id: judgeId },
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!judge) {
      res.status(400);
      throw new Error("Deletion failed");
    }

    res.status(200).json({
      success: true,
      msg: `${judge?.name} successfully deleted`,
    });
  }
);

// GET || get judge details
export const getJudgeDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const searchData = (req.query.search as string) || "";
    const zones = (req.query.zones as any) || "";
    const status = (req.query.status as any) || "";

    const query: any = { isDeleted: false };
    if (searchData !== "") {
      query.name = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }
    if (zones !== "") {
      query.zone = { $in: zones };
    }
    if (status !== "") {
      query.isBlocked = status;
    }
    const judge = await Judge.find(query)
      .populate("zone")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocuments = await Judge.countDocuments(query);

    res.status(200).json({
      success: true,
      judge: judge || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: "Judge details successfully retrieved",
    });
  }
);

// PATCH ||  block or unblock judge details

export const blockOrUnblock = asyncHandler(
  async (req: Request, res: Response) => {
    const { judgeId } = req.query;

    if (!judgeId) {
      res.status(400);
      throw new Error("judgeId not found");
    }

    const judge = await Judge.findOne(
      { _id: judgeId },
      {
        isBlocked: 1,
      }
    );
    if (!judge) {
      res.status(400);
      throw new Error("Updation failed");
    }
    let msg = "";
    const isInLiveCompetition = await Result.findOne({
      zone: new mongoose.Types.ObjectId(String(judge?.zone)),
      isCompleted: false,
      isDeleted: false,
    });

  
    if (judge?.isBlocked === true) {
      if (isInLiveCompetition) {
        res.status(400);
        throw new Error(
          "This judge's zones already have active competitions, so unblocking is not possible at this time."
        );
      }
      msg = `${judge?.name} successfully unblocked`;
      judge.isBlocked = false;
    } else {
      if (isInLiveCompetition) {
        msg = `You blocked a judge with an active competition, so unblocking isn't possible until this competition is completed`;
      } else {
        msg = `${judge?.name} successfully blocked`;
      }
      judge.isBlocked = true;
    }
    await judge.save();
    res.status(200).json({
      success: true,
      msg,
    });
  }
);

// PATCH ||  update judge password details

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { judgeId, password } = req.query;

    if (!judgeId) {
      res.status(400);
      throw new Error("judgeId not found");
    }

    const judge = await Judge.findByIdAndUpdate(
      { _id: judgeId },
      {
        password: password,
      },
      { new: true }
    );
    if (!judge) {
      res.status(400);
      throw new Error("Password updation failed");
    }

    res.status(200).json({
      success: true,
      msg: `${judge?.name}'s password successfully updated`,
    });
  }
);

// GET || get single Judge details
export const getSingleJudgeDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { judgeId } = req.params;
    if (!judgeId) {
      res.status(400);
      throw new Error("judgeId is required");
    }
    const judge = await Judge.findOne({
      _id: judgeId,
      isDeleted: false,
    }).populate("zone");
    if (!judge) {
      res.status(400);
      throw new Error("Judge not found");
    }
    res.status(200).json({
      success: true,
      judge: judge,
      msg: "Judge details successfully retrieved",
    });
  }
);
