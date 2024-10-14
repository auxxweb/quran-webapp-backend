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
exports.blockOrUnblock = exports.getJudgeDetails = exports.deletejudgeDetails = exports.updateJudgeDetails = exports.uploadJudgeDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const judge_1 = __importDefault(require("../../models/judge"));
exports.uploadJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, address, gender, zone, isMain } = req.body;
    if (!name || !email || !phone || !address || !gender || !zone) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${name}$`);
    const existJudge = yield judge_1.default.findOne({
        name: { $regex: regExp, $options: "" },
        isDeleted: false,
    });
    if (existJudge) {
        res.status(400);
        throw new Error(`${name} judge already exists`);
    }
    if (isMain === true) {
        const mainJudge = yield judge_1.default.findOne({
            zone: zone,
            isMain: true,
            isDeleted: false,
        });
        if (mainJudge) {
            res.status(400);
            throw new Error(`Main judge already exists`);
        }
    }
    const judge = yield judge_1.default.create(Object.assign({}, req.body));
    if (!judge) {
        res.status(400);
        throw new Error("Judge upload failed");
    }
    res.status(201).json({
        success: true,
        msg: "Judge details successfully uploaded",
    });
}));
// PATCH || update Judge details
exports.updateJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId, name } = req.body;
    if (!judgeId) {
        res.status(400);
        throw new Error("Judge Id  not found");
    }
    if (name) {
        const judge = yield judge_1.default.findOne({
            _id: judgeId,
            isDeleted: false,
        });
        if (!judge) {
            res.status(404);
            throw new Error("Judge not found");
        }
        if (judge.name !== name) {
            const regExp = new RegExp(`^${name}$`);
            const existJudge = yield judge_1.default.findOne({
                name: { $regex: regExp, $options: "" },
                isDeleted: false,
            });
            if (existJudge) {
                res.status(400);
                throw new Error("This judge already exists");
            }
        }
    }
    const updatedJudge = yield judge_1.default.findOneAndUpdate({ _id: judgeId, isDeleted: false }, req.body, { new: true });
    if (!updatedJudge) {
        res.status(400);
        throw new Error("Judge not updated");
    }
    res.status(200).json({
        success: true,
        msg: "Judge details successfully updated",
    });
}));
// DELETE ||  delete judge details
exports.deletejudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId } = req.query;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
    }
    const judge = yield judge_1.default.findByIdAndUpdate({ _id: judgeId }, {
        isDeleted: true,
    }, { new: true });
    if (!judge) {
        res.status(400);
        throw new Error("Deletion failed");
    }
    res.status(200).json({
        success: true,
        msg: `${judge === null || judge === void 0 ? void 0 : judge.name} successfully deleted`,
    });
}));
// GET || get judge details
exports.getJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const judge = yield judge_1.default.find({ isDeleted: false });
    res.status(200).json({
        success: true,
        judge: judge || [],
        msg: "Zone details successfully retrieved",
    });
}));
// PATCHTE ||  block or unblock judge details
exports.blockOrUnblock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId } = req.query;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
    }
    const judge = yield judge_1.default.findByIdAndUpdate({ _id: judgeId }, {
        isBlocked: true,
    }, { new: true });
    if (!judge) {
        res.status(400);
        throw new Error("Updation failed");
    }
    res.status(200).json({
        success: true,
        msg: `${judge === null || judge === void 0 ? void 0 : judge.name} successfully deleted`,
    });
}));
