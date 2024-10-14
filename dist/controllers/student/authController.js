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
exports.loginStudent = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const constants_1 = require("../../config/constants");
const userModel_1 = __importDefault(require("../../models/userModel"));
exports.loginStudent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobileNumber, password } = req.body;
    if (!mobileNumber || !password) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const student = yield userModel_1.default.findOne({ phone: mobileNumber, role: "Student", isDeleted: false });
    if (!student) {
        res.status(400);
        throw new Error("Student does't exist");
    }
    const isMatch = yield bcryptjs_1.default.compare(password, student.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Incorrect Password!");
    }
    let studentInfo = {
        email: student === null || student === void 0 ? void 0 : student.email,
        id: student === null || student === void 0 ? void 0 : student._id,
        role: student === null || student === void 0 ? void 0 : student.role,
        number: student === null || student === void 0 ? void 0 : student.phone,
        token: (0, constants_1.generateToken)(student === null || student === void 0 ? void 0 : student._id, "5d"),
    };
    res.status(200).json({
        success: true,
        student: studentInfo,
        msg: "Login successfully",
    });
}));
