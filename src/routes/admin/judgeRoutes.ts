import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares";

import {
  deletejudgeDetails,
  getJudgeDetails,
  updateJudgeDetails,
  uploadJudgeDetails,
  blockOrUnblock,
  updatePassword,
  getSingleJudgeDetails
} from "../../controllers/admin/judgeController";

// Zone routes
router
  .route("/")
  .post(adminProtect, uploadJudgeDetails)
  .patch(adminProtect, updateJudgeDetails)
  .get(adminProtect, getJudgeDetails)
  .delete(adminProtect, deletejudgeDetails);

router.route("/blockOrUnblock").patch(adminProtect, blockOrUnblock);

router.route("/updatePassword").patch(adminProtect, updatePassword);
router.get("/:judgeId",adminProtect,getSingleJudgeDetails)

export default router;
