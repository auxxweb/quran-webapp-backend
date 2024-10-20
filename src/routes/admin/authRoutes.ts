import express from 'express'
import { adminLogin, forgetPassword,changePassword } from '../../controllers/admin/authController'

const router = express.Router()

router.post('/login',adminLogin)
router.post('/forgetPassword',forgetPassword)
router.post('/changePassword',changePassword)

export default router