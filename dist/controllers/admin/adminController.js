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
exports.updatePassword = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const admin_1 = __importDefault(require("../../models/admin"));
// PATCH ||  update admin password details
exports.updatePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, password } = req.body;
    const admin = req.admin;
    if (!admin) {
        res.status(400);
        throw new Error("admin not found");
    }
    const isMatch = yield bcryptjs_1.default.compare(oldPassword, admin.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Incorrect Password!");
    }
    const salt = yield bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password.trim(), salt);
    const updatedAdmin = yield admin_1.default.findByIdAndUpdate({ _id: admin === null || admin === void 0 ? void 0 : admin._id }, {
        password: hashedPassword,
    }, { new: true });
    if (!updatedAdmin) {
        res.status(400);
        throw new Error("Password updation failed");
    }
    res.status(200).json({
        success: true,
        msg: `admin's password successfully updated`,
    });
}));
