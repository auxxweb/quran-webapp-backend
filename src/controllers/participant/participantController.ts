import { NextFunction, Request, Response } from "express";

import Participant from "../../models/participant";
import mongoose from "mongoose";
import Result from "../../models/result";
import Zone from "../../models/zones";




export const getZoneDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
console.log(id,"id");

if (!mongoose.Types.ObjectId.isValid(id) ) {
  return res.status(400).json({
    message: "Invalid Question or Result ID",
    success: false,
  });
}

    const zone = await Zone.findOne({ _id: id, isDeleted: false },{name:1})

    if (!zone) {
      return res.status(200).json({
        message: "Zone not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "zone fetched successfully",
      zone: zone,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid participant ID",
        success: false,
      });
    }

    const participant = await Participant.findOne({ _id: id, isDeleted: false },{name:1,image:1,zone:1}).populate('zone','name')

    if (!participant) {
      return res.status(404).json({
        message: "Participant not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Participant fetched successfully",
      participant: participant,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { questionId, resultId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(questionId) ||
      !mongoose.Types.ObjectId.isValid(resultId)
    ) {
      return res.status(400).json({
        message: "Invalid Question or Result ID",
        success: false,
      });
    }

    // Find and populate necessary fields
    const result = await Result.findOne({ _id: resultId, isDeleted: false })
      .populate("zone", "name")
      .populate("participant_id", "name image")
      .populate({
        path: "bundle_id",
        populate: {
          path: "questions",
          select: "question", // Populate only the question field
        },
      });

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
        success: false,
      });
    }

    result?.bundle_id?.questions?.sort((a: any, b: any) => a?._id?.toString()?.localeCompare(b?._id.toString()));

    const questionIndex = result.bundle_id.questions.findIndex(
      (question: any) => question._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        message: "Question not found in the bundle",
        success: false,
      });
    }

    // Get the matched question
    const matchingQuestion = result.bundle_id.questions[questionIndex];

    // Send response with the question number based on the sorted order
    return res.status(200).json({
      message: "Question fetched successfully",
      result: {
        question: matchingQuestion,
        questionNumber: questionIndex + 1,
        zone: result.zone,
        participant: result.participant_id,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};



