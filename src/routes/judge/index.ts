import express from "express";
const router = express.Router();
import authRouter from './authRoutes'
import userRouter from './userRouter'
import { JudgeProtect } from "../../middlewares/judgeAuthMiddlewares";


router.use("/auth", authRouter);

router.use("/users",JudgeProtect, userRouter);


export default router;
