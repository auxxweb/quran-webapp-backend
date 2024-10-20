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
exports.changePassword = exports.forgetPassword = exports.adminLogin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uniqid_1 = __importDefault(require("uniqid"));
const store_1 = __importDefault(require("store"));
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
// POST ||  forget Password
exports.forgetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(req.body, "req.body");
    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }
    const admin = yield admin_1.default.findOne({
        email,
        isDeleted: false,
    });
    if (!admin) {
        res.status(400);
        throw new Error("Your Email has no account");
    }
    let tx_uuid = (0, uniqid_1.default)().slice(0, 10);
    store_1.default.set("uuid", { tx: tx_uuid });
    admin.forgotId = tx_uuid;
    admin.save();
    res.status(200).json({
        success: true,
        msg: "Verification link successfully sent to your email.",
    });
}));
// POST ||  change Password
exports.changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, forgotId } = req.body;
    if (!password || !forgotId) {
        res.status(400);
        throw new Error("Email and forgotId are required");
    }
    const admin = yield admin_1.default.findOne({
        forgotId,
        isDeleted: false,
    });
    if (!admin) {
        res.status(400);
        throw new Error("This verification link is not valid");
    }
    const salt = yield bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password.trim(), salt);
    admin.password = hashedPassword;
    admin.forgotId = "";
    admin.save();
    res.status(200).json({
        success: true,
        msg: "Your password changed successfully",
    });
}));
