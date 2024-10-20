import { NextFunction, Request, Response } from "express";

import Participant from "../../models/participant";


export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const participant = await Participant.findOne({ _id: req.params.id, });
      
      if (!participant) {
        return res.status(404).json({
          message: "participant not found",
          success: false,
        });
      }
  
      return res.status(200).json({
        message: "participant fetched successfully",
        participant: participant,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
