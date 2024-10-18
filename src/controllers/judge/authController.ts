import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import Judge from "../../models/judge";

import { LoginDto } from "../../dto/loginDto";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import {  judgeGenerateToken } from "../../config/constants";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const login_dto = plainToClass(LoginDto, req.body ?? {});
    const error_messages = await validate(login_dto);
    if (error_messages && error_messages.length > 0) {
      const error = await handleValidationErrors(res, error_messages);
      return res.status(401).json({ error });
    }

    const { name, password } = req.body;

    const judge = await Judge.findOne({ name: name }).populate('zone');

    if (!judge) {
      return res.status(401).json({
        errors: { name: "Account not found, invalid name" },
        success: false,
      });
    }

    if (judge.password !== password) {
      return res
        .status(401)
        .json({ success: false,errors: { password: "Password does not match" } });
    }

    if (judge.isBlocked) {
      return res
        .status(401)
        .json({ success: false,errors: { common: "Access denied. Please contact the admin." } });
    }

    let judgeInfo = {
      email: judge?.email,
      name: judge?.name,
      zone:judge?.zone.name,
      isMain:judge?.isMain,
      id: judge?._id,
      token: judgeGenerateToken(judge?._id, "7d"),
    };

    res.status(200).json({
      success: true,
      data: judgeInfo,
      message: "Login successfully",
    });

  } catch (error) {
    next(error);
  }
};
