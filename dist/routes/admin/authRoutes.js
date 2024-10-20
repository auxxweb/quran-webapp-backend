"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/admin/authController");
const router = express_1.default.Router();
router.post('/login', authController_1.adminLogin);
router.post('/forgetPassword', authController_1.forgetPassword);
router.post('/changePassword', authController_1.changePassword);
exports.default = router;
