import { Router } from "express";
import { answersSubmit, getUser, proceedToQuestion } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/", getUser);

router.post("/proceed-to-question", proceedToQuestion);

router.post("/submit-answers", answersSubmit);

export default router;
