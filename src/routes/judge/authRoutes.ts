import { Router } from "express";
import { login } from "../../controllers/judge/authController";

const router: Router = Router();


router.post("/login", login);

export default router;
