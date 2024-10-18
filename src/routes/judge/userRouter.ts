import { Router } from "express";
import { answersSubmit, getParticipantQuestions, getUser, getUsers, proceedToQuestion } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/", getUsers);

router.get("/:id", getUser);

router.post("/proceed-to-question", proceedToQuestion);

router.post("/submit-answers", answersSubmit);

router.get("/questions/:result_id", getParticipantQuestions);

export default router;
