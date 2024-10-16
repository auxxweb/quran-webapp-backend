import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Judge from "../../models/judge";
import crypto from "crypto";

export const uploadJudgeDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, address, gender, zone, isMain } = req.body;

    if (!name || !email || !phone || !address || !gender || !zone) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }

    const existJudge = await Judge.findOne({
      email,
      isDeleted: false,
    });
    if (existJudge) {
      res.status(400);
      throw new Error(`${email}  already exists`);
    }
    if (isMain === true) {
      const mainJudge = await Judge.findOne({
        zone: zone,
        isMain: true,
        isDeleted: false,
      });
      if (mainJudge) {
        res.status(400);
        throw new Error(`A main judge already exists in this zone`);
      }
    }
    const plainPassword = crypto.randomBytes(8).toString("hex");
    const judge = await Judge.create({ ...req.body, password: plainPassword });
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
  async (req: Request, res: Response) => {
    const { judgeId, email, isMain, zone } = req.body;

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
    if (isMain === true && zone) {
      const mainJudge = await Judge.findOne({
        zone: zone,
        isMain: true,
        isDeleted: false,
        _id: { $ne: judgeId },
      }).populate("zone");
      if (mainJudge) {
        res.status(400);
        throw new Error(
          `A main judge already exists in zone ${mainJudge?.zone?.name}`
        );
      }
    }

    const updatedJudge = await Judge.findOneAndUpdate(
      { _id: judgeId, isDeleted: false },
      req.body,
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
    if (judge?.isBlocked === true) {
      msg = `${judge?.name} successfully unblocked`;
      judge.isBlocked = false;
    } else {
      msg = `${judge?.name} successfully blocked`;
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
