import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Judge from "../../models/judge";

export const uploadJudgeDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, address, gender, zone, isMain } = req.body;

    if (!name || !email || !phone || !address || !gender || !zone) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${name}$`);

    const existJudge = await Judge.findOne({
      name: { $regex: regExp, $options: "" },
      isDeleted: false,
    });
    if (existJudge) {
      res.status(400);
      throw new Error(`${name} judge already exists`);
    }
    if (isMain === true) {
      const mainJudge = await Judge.findOne({
        zone: zone,
        isMain: true,
        isDeleted: false,
      });
      if (mainJudge) {
        res.status(400);
        throw new Error(`Main judge already exists`);
      }
    }

    const judge = await Judge.create({ ...req.body });
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
    const { judgeId, name } = req.body;

    if (!judgeId) {
      res.status(400);
      throw new Error("Judge Id  not found");
    }
    if (name) {
      const judge = await Judge.findOne({
        _id: judgeId,
        isDeleted: false,
      });
      if (!judge) {
        res.status(404);
        throw new Error("Judge not found");
      }

      if (judge.name !== name) {
        const regExp = new RegExp(`^${name}$`);

        const existJudge = await Judge.findOne({
          name: { $regex: regExp, $options: "" },
          isDeleted: false,
        });

        if (existJudge) {
          res.status(400);
          throw new Error("This judge already exists");
        }
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
    const judge = await Judge.find({ isDeleted: false });

    res.status(200).json({
      success: true,
      judge: judge || [],
      msg: "Zone details successfully retrieved",
    });
  }
);

// PATCHTE ||  block or unblock judge details

export const blockOrUnblock = asyncHandler(
    async (req: Request, res: Response) => {
      const { judgeId } = req.query;
  
      if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
      }
  
      const judge = await Judge.findByIdAndUpdate(
        { _id: judgeId },
        {
          isBlocked: true,
        },
        { new: true }
      );
      if (!judge) {
        res.status(400);
        throw new Error("Updation failed");
      }
  
      res.status(200).json({
        success: true,
        msg: `${judge?.name} successfully deleted`,
      });
    }
  );