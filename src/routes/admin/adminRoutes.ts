import express from "express";
import { adminProtect } from "../../middlewares/authMiddlewares";
import { updatePassword } from "../../controllers/admin/adminController";

const router = express.Router();

router.route("/updatePassword").patch(adminProtect, updatePassword);

export default router;
