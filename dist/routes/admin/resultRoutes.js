"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const resultControllers_1 = require("../../controllers/admin/resultControllers");
const router = express_1.default.Router();
router.get("/", authMiddlewares_1.adminProtect, resultControllers_1.getResultsDetails);
router.get("/:resultId", authMiddlewares_1.adminProtect, resultControllers_1.getSingleResultsDetails);
router.patch("/updateAnswer", authMiddlewares_1.adminProtect, resultControllers_1.updateAnswer);
exports.default = router;
