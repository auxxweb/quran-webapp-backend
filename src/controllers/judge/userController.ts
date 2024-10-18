import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import Participant from "../../models/participant";
import Result from "../../models/result";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { ResultDto } from "../../dto/resultDto";

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

    const result = new Result({
      participant_id: participant_id,
      startTime,
      endTime,
      zone: req.judge.zone,
    });
    result.save();

    return res.status(200).json({
      message: "Result saved successfully",
      result: result,
    });
  } catch (error) {
    next(error);
  }
};
