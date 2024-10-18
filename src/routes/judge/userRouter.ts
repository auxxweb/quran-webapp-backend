import { Router } from "express";
import { getUser, proceedToQuestion } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/", getUser);

router.get("/proceed-to-question", proceedToQuestion);

export default router;
