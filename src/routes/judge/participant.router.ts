import { Router } from "express";
import { answersSubmit, getParticipantQuestions,proceedToNextQuestion, getUser, getUsers, proceedToQuestion, getParticipantQuestionsByZone } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/questions/zone/:zone_id", getParticipantQuestionsByZone);

export default router;
