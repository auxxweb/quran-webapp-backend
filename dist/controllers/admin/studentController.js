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
exports.postNoticeDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const NoticeModel_1 = __importDefault(require("../../models/NoticeModel"));
exports.postNoticeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const notice = yield NoticeModel_1.default.create(req.body);
    if (!notice) {
        res.status(400);
        throw new Error("Notice Not created");
    }
    res.status(201).json({
        success: true,
        msg: "Notice created successfully",
    });
}));
