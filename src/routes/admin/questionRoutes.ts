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

  router.get("/all", adminProtect,getAllQuestionsNames)
  router.get("/:questionId",adminProtect,getSingleQuestionDetails)

export default router;
