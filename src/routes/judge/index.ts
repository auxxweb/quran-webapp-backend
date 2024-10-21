import express from 'express'
const router = express.Router()
import authRouter from './authRoutes'
import userRouter from './userRouter'
import participantRouter from './participant.router'
import { JudgeProtect } from '../../middlewares/judgeAuthMiddlewares'

router.use('/auth', authRouter)

router.use('/users', JudgeProtect, userRouter)
router.use('/participant', participantRouter)

export default router
