import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// import { generateToken } from "../../config/constants";
import Admin from "../../models/admin";

// POST ||  Login
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password,name } = req.body;
    const salt: string = await bcrypt.genSalt(10);

  const hashedPassword=  await bcrypt.hash(password, salt);



  const admin = await Admin.create({
    ...req.body,
    password: hashedPassword,
  });

  // if (!email || !password) {
  //   res.status(400);
  //   throw new Error("Please enter all the fields");
  // }
  // const admin = await Admin.findOne({
  //   email,
  //   isDeleted: false,
  // });

  // if (!admin) {
  //   res.status(400);
  //   throw new Error("Your email has no account");
  // }
  // const isMatch = await bcrypt.compare(password, admin.password);

  // if (!isMatch) {
  //   res.status(400);
  //   throw new Error("Incorrect Password!");
  // }
  // let adminInfo = {
  //   email: admin?.email,
  //   id: admin?._id,
  //   token: generateToken(admin?._id, "7d"),
  // };
  // res.status(200).json({
  //   success: true,
  //   admin: adminInfo,
  //   msg: "Login successfully",
  // });
});
