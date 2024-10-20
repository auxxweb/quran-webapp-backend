import { Router } from "express";
import { getUser } from "../../controllers/participant/participantController";

const router: Router = Router();

router.get("/:id", getUser);


export default router;