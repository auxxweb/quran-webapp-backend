"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const questionController_1 = require("../../controllers/admin/questionController");
// Question routes
router
    .route("/")
    .post(authMiddlewares_1.adminProtect, questionController_1.uploadQuestionDetails)
    .patch(authMiddlewares_1.adminProtect, questionController_1.updateQuestionDetails)
    .get(authMiddlewares_1.adminProtect, questionController_1.getQuestionDetails)
    .delete(authMiddlewares_1.adminProtect, questionController_1.deleteQuestionDetails);
router.get("/all", authMiddlewares_1.adminProtect, questionController_1.getAllQuestionsNames);
exports.default = router;
