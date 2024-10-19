"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRouter_1 = __importDefault(require("./userRouter"));
const judgeAuthMiddlewares_1 = require("../../middlewares/judgeAuthMiddlewares");
router.use("/auth", authRoutes_1.default);
router.use("/users", judgeAuthMiddlewares_1.JudgeProtect, userRouter_1.default);
exports.default = router;
