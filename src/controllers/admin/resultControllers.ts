import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Result from "../../models/result";
import Answer from "../../models/answers";

// GET || get Result details
export const getResultsDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const searchData = (req.query.search as string) || "";
    const zones = (req.query.zones as any) || "";

    const query: any = { isDeleted: false,isCompleted:true };
    if (searchData !== "") {
      query.participant_id.name = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }
    if (zones !== "") {
      query.zone = { $in: zones };
    }

    const results = await Result.find(query)
      .populate("zone",'_id name ')
      .populate("participant_id","name image")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocuments = await Result.countDocuments(query);

    res.status(200).json({
      success: true,
      results: results || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: "Result details successfully retrieved",
    });
  }
);

// GET || get single Result details
export const getSingleResultsDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { resultId } = req.params;
    if (!resultId) {
      res.status(400);
      throw new Error("resultId is required");
    }
    const result = await Result.findOne({ _id: resultId, isDeleted: false,isCompleted:true })
    .populate("zone",'_id name ')
    .populate("participant_id","_id name image email phone address")
    const answers = await Answer.findOne({ result_id: resultId, isDeleted: false,isCompleted:true })
    .populate("question_id",'_id name ')
    .populate("Judge","_id name image")



    if (!result) {
      res.status(400);
      throw new Error("Result not found");
    }
   

    res.status(200).json({
      success: true,
      result: result,
      answers:answers,
      msg: "Result details successfully retrieved",
    });
  }
);
