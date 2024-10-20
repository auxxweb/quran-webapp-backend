"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/judge/userController");
const router = (0, express_1.Router)();
router.get("/", userController_1.getUsers);
router.get("/:id", userController_1.getUser);
router.post("/proceed-to-question", userController_1.proceedToQuestion);
router.post("/proceed-to-next-question", userController_1.proceedToNextQuestion);
router.post("/submit-answers", userController_1.answersSubmit);
router.get("/questions/:result_id", userController_1.getParticipantQuestions);
exports.default = router;
