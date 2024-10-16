import express from "express";
import { adminProtect } from "../../middlewares/authMiddlewares";
import { getResultsDetails,getSingleResultsDetails } from "../../controllers/admin/resultControllers";
const router = express.Router();


router.get("/",adminProtect,getResultsDetails)
router.get("/:resultId",adminProtect,getSingleResultsDetails)

export default router