import { NextFunction, Request, Response } from "express";
import Participant from "../../models/participant";

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

    return res.json({
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
