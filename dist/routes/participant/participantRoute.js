"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const participantController_1 = require("../../controllers/participant/participantController");
const router = (0, express_1.Router)();
router.get("/:id", participantController_1.getUser);
router.get("/zone/:id", participantController_1.getZoneDetails);
router.get("/question/:resultId/:questionId", participantController_1.getQuestion);
exports.default = router;
