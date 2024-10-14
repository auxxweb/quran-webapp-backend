
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import Admin from "../models/admin";

const secret: Secret = process.env.JWT_SECRET as Secret;


export const adminProtect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.admin = await Admin.findOne({ _id: decoded.id, isDeleted: false }).select("-password");
      next();
    } catch (error) {
      res.status(401);
      console.log(error);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});