import { Router } from "express";
import { getQuestion, getUser,getZoneDetails } from "../../controllers/participant/participantController";

const router: Router = Router();

router.get("/:id", getUser);
router.get("/zone/:id", getZoneDetails);
router.get("/question/:resultId/:questionId", getQuestion);


export default router;