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

    const result = await Result.findOne({
      _id: resultId,
      isDeleted: false,
      isCompleted: true,
    })
      .populate("zone", "_id name")
      .populate("participant_id", "_id name image email phone address");

    if (!result) {
      res.status(400);
      throw new Error("Result not found");
    }

    const answers = await Answer.find({
      result_id: resultId,
      isCompleted: true,
    })
      .populate("question_id", "_id question answer")
      .populate("judge_id", "_id name image isMain");

    const groupedAnswers: any = {};
    let totalScore = 0;
    answers?.forEach((answer: any) => {
      const questionId = answer?.question_id?._id;

      if (answer?.judge_id?.isMain) {
        if (!groupedAnswers[questionId]) {
          groupedAnswers[questionId] = {
            question_id: questionId,
            question: answer.question_id?.question,
            answer: answer.question_id?.answer,
            startTime: answer?.startTime,
            endTime: answer?.endTime,
            totalScore: 0,
            answers: [],
          };
        } else {
          groupedAnswers[questionId].startTime = answer?.startTime;
          groupedAnswers[questionId].endTime = answer?.endTime;
        }
      } else {
        if (!groupedAnswers[questionId]) {
          groupedAnswers[questionId] = {
            question_id: questionId,
            question: answer?.question_id?.question,
            answer: answer?.question_id?.answer,
            startTime: null,
            endTime: null,
            totalScore: 0,
            answers: [],
          };
        }

        groupedAnswers[questionId]?.answers?.push({
          answer: answer?.answer,
          score: answer?.score,
          judge: {
            _id: answer?.judge_id?._id,
            name: answer?.judge_id?.name,
            image: answer?.judge_id?.image,
          },
          startTime: answer?.startTime,
          endTime: answer?.endTime,
        });

        groupedAnswers[questionId].totalScore += answer?.score || 0;
        totalScore += answer?.score || 0;
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

// PATCH || update single score

export const updateAnswer = asyncHandler(
  async (req: Request, res: Response) => {
    const { answerId } = req.body;

    if (!answerId) {
      res.status(400);
      throw new Error("Answer Id  not found");
    }

    const updatedAnswer = await Answer.findOneAndUpdate(
      { _id: answerId, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!updatedAnswer) {
      res.status(400);
      throw new Error("Answer not updated");
    }

    res.status(200).json({
      success: true,
      msg: "Answer details successfully updated",
    });
  }
);
