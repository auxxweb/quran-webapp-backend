"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const constants_1 = require("../../config/constants");
const admin_1 = __importDefault(require("../../models/admin"));
// POST ||  Login
exports.adminLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const admin = yield admin_1.default.findOne({
        email,
        isDeleted: false,
    });
    if (!admin) {
        res.status(400);
        throw new Error("Your email has no account");
    }
    const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Incorrect Password!");
    }
    let adminInfo = {
        email: admin === null || admin === void 0 ? void 0 : admin.email,
        id: admin === null || admin === void 0 ? void 0 : admin._id,
        token: (0, constants_1.generateToken)(admin === null || admin === void 0 ? void 0 : admin._id, "7d"),
    };
    res.status(200).json({
        success: true,
        admin: adminInfo,
        msg: "Login successfully",
    });
}));
