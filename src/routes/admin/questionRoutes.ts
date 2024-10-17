import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares";
import {
  deleteQuestionDetails,
  getAllQuestionsNames,
  getQuestionDetails,
  getSingleQuestionDetails,
  updateQuestionDetails,
  uploadQuestionDetails,
} from "../../controllers/admin/questionController";

// Question routes

router
  .route("/")
  .post(adminProtect, uploadQuestionDetails)
  .patch(adminProtect, updateQuestionDetails)
  .get(adminProtect, getQuestionDetails)
  .delete(adminProtect, deleteQuestionDetails);

  router.get("/:questionId",adminProtect,getSingleQuestionDetails)
  router.get("/all", adminProtect,getAllQuestionsNames)

export default router;
