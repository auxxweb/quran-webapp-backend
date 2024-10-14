"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const judgeController_1 = require("../../controllers/admin/judgeController");
// Zone routes
router
    .route("/")
    .post(authMiddlewares_1.adminProtect, judgeController_1.uploadJudgeDetails)
    .patch(authMiddlewares_1.adminProtect, judgeController_1.updateJudgeDetails)
    .get(authMiddlewares_1.adminProtect, judgeController_1.getJudgeDetails)
    .delete(authMiddlewares_1.adminProtect, judgeController_1.deletejudgeDetails);
router
    .route("/blockOrUnblock")
    .patch(authMiddlewares_1.adminProtect, judgeController_1.blockOrUnblock);
exports.default = router;
