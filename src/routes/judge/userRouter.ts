import { Router } from "express";
import { getUser } from "../../controllers/judge/userController";

const router: Router = Router();


router.get("/", getUser);

export default router;
