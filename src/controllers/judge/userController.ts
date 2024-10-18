import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import Participant from "../../models/participant";
import Result from "../../models/result";
import Answer from "../../models/answers";
import Bundle from "../../models/bundle";

import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { ResultDto } from "../../dto/resultDto";
import { AnswersDto } from "../../dto/answers";
import mongoose from "mongoose";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPage = 1, pageSize = 10, search } = req.query;
    const page = parseInt(currentPage as string) || 1;
    const limit = parseInt(pageSize as string) || 10;
    const skip = (page - 1) * limit;
    const zone = req.judge.zone;
    const searchRegex = new RegExp(search as string, "i");

    const query = {
      $and: [
        { zone },
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { address: searchRegex },
          ],
        },
      ],
    };

    const participants = await Participant.find(query).skip(skip).limit(limit);

    const total = await Participant.countDocuments(query);

    return res.status(200).json({
      message: "Participants fetched successfully",
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      participants,
    });
  } catch (error) {
    next(error);
  }
};

export const proceedToQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result_dto = plainToClass(ResultDto, req.body ?? {});
    const error_messages = await validate(result_dto);
    if (error_messages && error_messages.length > 0) {
      const error = await handleValidationErrors(res, error_messages);
      throw res.status(401).json({ error });
    }
    const { participant_id, startTime, endTime } = req.body;


    const participant = await Participant.findOne({ _id: participant_id });

    if (participant == null) {
        return res.status(400).json({
            message: "participant not found.",
        });
    }

    if (participant.zone.toString() != req.judge.zone.toString()) {
        return res.status(400).json({
            message: "participant and judge zone not same.",
        });
    }

    const aggregationResult = await Result.aggregate([
      {
        $match: { participant_id: new mongoose.Types.ObjectId(participant_id) },
      },
      {
        $lookup: {
          from: "bundles",
          localField: "bundle_id",
          foreignField: "_id",
          as: "bundle",
        },
      },
      {
        $unwind: {
          path: "$bundle",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "result_id",
          as: "answeredQuestions",
        },
      },
      {
        $addFields: {
          questionCount: { $size: "$bundle.questions" },
          answeredCount: { $size: "$answeredQuestions" },
        },
      },
      {
        $project: {
          _id: 1,
          bundle_id: 1,
          questionCount: 1,
          answeredCount: 1,
        },
      },
    ]);


    if (aggregationResult.length > 0) {
      const { questionCount, answeredCount } = aggregationResult[0];

      if (answeredCount < questionCount) {
        return res.status(200).json({
          questionCount,
          answeredCount,
          message: "Participant has not completed all questions in the bundle.",
          success: true,
        });
      } else {
        return res.status(200).json({
          message:
            "Participant has already completed all questions in the bundle.",
            success: true,
        });
      }
    } else {
      const randomBundle = await Bundle.aggregate([{ $sample: { size: 1 } }]);
      const bundle_id = randomBundle.length > 0 ? randomBundle[0]._id : null;

      const result = new Result({
        participant_id: participant_id,
        bundle_id,
        startTime,
        endTime,
        zone: req.judge.zone,
      });

      await result.save();

      return res.status(200).json({
        message: "Result saved successfully",
        result: result,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};


export const answersSubmit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const answers_dto = plainToClass(AnswersDto, req.body ?? {});
    const error_messages = await validate(answers_dto);
    if (error_messages && error_messages.length > 0) {
      const error = await handleValidationErrors(res, error_messages);
      throw res.status(401).json({ error });
    }

    const { question_id, result_id, startTime, endTime, answer, score } =
      req.body;
  
      const answerData=await Answer.findOne({result_id,question_id})

      if(answerData){
        return res.status(400).json({
            message: "Answer already submitted",
            success: false,
          });
      }
    
    const data = new Answer({
      question_id,
      result_id,
      judge_id: req.judge._id,
      startTime,
      endTime,
      score,
      answer,
    });

    data.save();

    return res.status(200).json({
      message: "Result saved successfully",
      result: data,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
