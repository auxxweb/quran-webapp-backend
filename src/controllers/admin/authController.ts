import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import uniqid from "uniqid";
import store from "store";
import { generateToken } from "../../config/constants";
import Admin from "../../models/admin";

// POST ||  Login
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const salt: string = await bcrypt.genSalt(10);


  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const admin = await Admin.findOne({
    email:email?.trim(),
    isDeleted: false,
  });

  if (!admin) {
    res.status(400);
    throw new Error("Your email has no account");
  }
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    res.status(400);
    throw new Error("Incorrect Password!");
  }
  let adminInfo = {
    email: admin?.email,
    id: admin?._id,
    token: generateToken(admin?._id, "7d"),
  };
  res.status(200).json({
    success: true,
    admin: adminInfo,
    msg: "Login successfully",
  });
});
// POST ||  forget Password
export const forgetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }
    const admin = await Admin.findOne({
      email,
      isDeleted: false,
    });

    if (!admin) {
      res.status(400);
      throw new Error("Your Email has no account");
    }
    let tx_uuid = uniqid().slice(0, 10);
    store.set("uuid", { tx: tx_uuid });
    admin.forgotId = tx_uuid;
    admin.save();
    res.status(200).json({
      success: true,
      msg: "Verification link successfully sent to your email.",
    });
  }
);

// POST ||  change Password
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { password, forgotId } = req.body;

    if (!password || !forgotId) {
      res.status(400);
      throw new Error("Email and forgotId are required");
    }
    const admin = await Admin.findOne({
      forgotId,
      isDeleted: false,
    });

    if (!admin) {
      res.status(400);
      throw new Error("This verification link is not valid");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    admin.password = hashedPassword;
    admin.forgotId = "";
    admin.save();
    res.status(200).json({
      success: true,
      msg: "Your password changed successfully",
    });
  }
);
