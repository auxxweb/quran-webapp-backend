"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const participantController_1 = require("../../controllers/participant/participantController");
const router = (0, express_1.Router)();
router.get("/:id", participantController_1.getUser);
exports.default = router;
