"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/judge/userController");
const router = (0, express_1.Router)();
router.get("/questions/zone/:zone_id", userController_1.getParticipantQuestionsByZone);
exports.default = router;
