import express from "express";
import { adminProtect } from "../../middlewares/authMiddlewares";
import { updatePassword ,getDashboardDetails} from "../../controllers/admin/adminController";

const router = express.Router();

router.route("/updatePassword").patch(adminProtect, updatePassword);
router.route("/getDashboardDetails").get(adminProtect, getDashboardDetails);

export default router;
