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

    const query: any = { isDeleted: false, isCompleted: true };

    if (zones !== "") {
      query.zone = { $in: zones };
    }

    const participantMatch: any = {};
    if (searchData !== "") {
      participantMatch["name"] = {
        $regex: new RegExp(`^${searchData}.*`, "i"),
      };
    }

    const results = await Result.find(query)
      .populate({
        path: "participant_id",
        select: "name image",
        match: participantMatch,
      })
      .populate("zone", "_id name")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const filteredResults = results.filter(
      (result: any) => result.participant_id !== null
    );

    const resultIds = filteredResults.map((result: any) => result._id);

    const totalScores = await Answer.aggregate([
      { $match: { result_id: { $in: resultIds }, isCompleted: true } },
      {
        $group: {
          _id: "$result_id",
          totalScore: { $sum: "$score" },
        },
      },
    ]);

    const resultsWithTotalScores = filteredResults.map((result: any) => {
      const totalScore = totalScores.find(
        (score: any) => String(score._id) === String(result._id)
      );
      return {
        ...result.toObject(),
        totalScore: totalScore ? totalScore.totalScore : 0,
      };
    });

    const totalDocuments = await Result.countDocuments(query);

    res.status(200).json({
      success: true,
      results: resultsWithTotalScores || [],
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

    // Fetch the result
    const result = await Result.findOne({
      _id: resultId,
      isDeleted: false,
      isCompleted: true,
    })
      .populate("zone", "_id name ")
      .populate("participant_id", "_id name image email phone address");

    if (!result) {
      res.status(400);
      throw new Error("Result not found");
    }

    // Fetch the answers for the given result
    const answers = await Answer.find({
      result_id: resultId,
      isCompleted: true,
    })
      .populate("question_id", "_id name ")
      .populate("judge_id", "_id name image isMain");

    const groupedAnswers: any = {};
    let totalScore = 0;

    answers.forEach((answer:any) => {
      if (answer.judge_id.isMain) {
        if (!groupedAnswers[answer.question_id._id]) {
          groupedAnswers[answer.question_id._id] = {
            question_id: answer.question_id._id,
            question_name: answer.question_id.name,
            startTime: answer.startTime,
            endTime: answer.endTime,
            totalScore: 0, 
            answers: [], 
          };
        }
      } else {
        if (!groupedAnswers[answer.question_id._id]) {
          groupedAnswers[answer.question_id._id] = {
            question_id: answer.question_id._id,
            question_name: answer.question_id.name,
            startTime: null, 
            endTime: null, 
            totalScore: 0, 
            answers: [],
          };
        }

        groupedAnswers[answer.question_id._id].answers.push({
          answer: answer.answer,
          score: answer.score,
          judge: {
            _id: answer.judge_id._id,
            name: answer.judge_id.name,
            image: answer.judge_id.image,
          },
          startTime: answer.startTime,
          endTime: answer.endTime,
        });

        groupedAnswers[answer.question_id._id].totalScore += answer.score || 0; 
      }
    });

    res.status(200).json({
      success: true,
      result: result,
      totalScore: totalScore,
      questions: Object.values(groupedAnswers), 
      msg: "Result details successfully retrieved",
    });
  }
);


