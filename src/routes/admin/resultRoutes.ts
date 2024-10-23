import express from "express";
import { adminProtect } from "../../middlewares/authMiddlewares";
import { getResultsDetails,getSingleResultsDetails,updateAnswer } from "../../controllers/admin/resultControllers";
const router = express.Router();


router.get("/",adminProtect,getResultsDetails)
router.get("/:resultId",adminProtect,getSingleResultsDetails)
router.patch("/updateAnswer",adminProtect,updateAnswer)

export default router