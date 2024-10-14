"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../../controllers/influencer/authController");
router.post("/login", authController_1.loginUser);
router.post("/signup", authController_1.signupUser);
router.post("/otpVerification", authController_1.otpVerification);
router.post("/postDetails", authController_1.postDetails);
router.post("/googleLogin", authController_1.googleLogin);
router.post("/googleSignup", authController_1.googleSignup);
router.post("/instaDetails", authController_1.instaDetails);
exports.default = router;
