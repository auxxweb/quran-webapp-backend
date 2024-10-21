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

    // Check if the IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        message: "Invalid Question or Result ID",
        success: false,
      });
    }

    // Find the result, populate zone, participant, and bundle with the full question details
    const result = await Result.findOne({ _id: resultId, isDeleted: false })
      .populate("zone", "name")
      .populate("participant_id", "name image")
      .populate({
        path: "bundle_id",
        populate: {
          path: "questions",select:"question" // Fully populate questions within bundle
        },
      });

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
        success: false,
      });
    }

    // Find the index of the question in the populated bundle that matches questionId
    const questionIndex = result?.bundle_id?.questions?.findIndex(
      (question:any) => question?._id.toString() === questionId
    );

    // Check if the question was found in the array
    if (questionIndex === -1) {
      return res.status(404).json({
        message: "Question not found in the bundle",
        success: false,
      });
    }

    // Get the question at the found index
    const matchingQuestion = result?.bundle_id?.questions[questionIndex];

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



