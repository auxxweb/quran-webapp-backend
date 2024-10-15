"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const participantController_1 = require("../../controllers/admin/participantController");
router
    .route("/")
    .post(authMiddlewares_1.adminProtect, participantController_1.uploadParticipantDetails)
    .patch(authMiddlewares_1.adminProtect, participantController_1.updateParticipantDetails)
    .get(authMiddlewares_1.adminProtect, participantController_1.getParticipantDetails)
    .delete(authMiddlewares_1.adminProtect, participantController_1.deleteParticipantDetails);
exports.default = router;
