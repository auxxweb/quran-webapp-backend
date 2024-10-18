import { Router } from "express";
import { answersSubmit, getParticipantQuestions, getUser, proceedToQuestion } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/", getUser);

router.post("/proceed-to-question", proceedToQuestion);

router.post("/submit-answers", answersSubmit);

router.get("/questions/:participant_id", getParticipantQuestions);

export default router;
