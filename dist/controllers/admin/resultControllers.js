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
exports.updateAnswer = exports.getSingleResultsDetails = exports.getResultsDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const result_1 = __importDefault(require("../../models/result"));
const answers_1 = __importDefault(require("../../models/answers"));
const mongoose_1 = __importDefault(require("mongoose"));
// GET || get Result details
exports.getResultsDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const searchData = req.query.search || "";
    const zones = req.query.zones || "";
    const query = { isDeleted: false, isCompleted: true };
    if (zones !== "") {
        query.zone = { $in: zones };
    }
    const participantMatch = {};
    if (searchData !== "") {
        participantMatch["name"] = {
            $regex: new RegExp(`^${searchData}.*`, "i"),
        };
    }
    const results = yield result_1.default.find(query)
        .populate({
        path: "participant_id",
        select: "name image",
        match: participantMatch,
    })
        .populate("zone", "_id name")
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const filteredResults = results.filter((result) => result.participant_id !== null);
    const resultIds = filteredResults.map((result) => result._id);
    const totalScores = yield answers_1.default.aggregate([
        { $match: { result_id: { $in: resultIds }, isCompleted: true } },
        {
            $group: {
                _id: "$result_id",
                totalScore: { $sum: "$score" },
            },
        },
    ]);
    const resultsWithTotalScores = filteredResults.map((result) => {
        const totalScore = totalScores.find((score) => String(score._id) === String(result._id));
        return Object.assign(Object.assign({}, result.toObject()), { totalScore: totalScore ? totalScore.totalScore : 0 });
    });
    const totalDocuments = yield result_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        results: resultsWithTotalScores || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: "Result details successfully retrieved",
    });
}));
// GET || get single Result details
exports.getSingleResultsDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resultId } = req.params;
    if (!resultId) {
        res.status(400);
        throw new Error("resultId is required");
    }
    const result = yield result_1.default.findOne({
        _id: resultId,
        isDeleted: false,
        isCompleted: true,
    })
        .populate("zone", "_id name")
        .populate("participant_id", "_id name image email phone address");
    if (!result) {
        res.status(400);
        throw new Error("Result not found");
    }
    const answers = yield answers_1.default.find({
        result_id: resultId,
        isCompleted: true,
    })
        .populate("question_id", "_id question answer")
        .populate("judge_id", "_id name image isMain");
    const groupedAnswers = {};
    let totalScore = 0;
    answers === null || answers === void 0 ? void 0 : answers.forEach((answer) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const questionId = (_a = answer === null || answer === void 0 ? void 0 : answer.question_id) === null || _a === void 0 ? void 0 : _a._id;
        if (((_b = answer === null || answer === void 0 ? void 0 : answer.judge_id) === null || _b === void 0 ? void 0 : _b._id.toString()) === ((_c = result === null || result === void 0 ? void 0 : result.mainJudge) === null || _c === void 0 ? void 0 : _c.toString())) {
            if (!groupedAnswers[questionId]) {
                groupedAnswers[questionId] = {
                    question_id: questionId,
                    question: (_d = answer.question_id) === null || _d === void 0 ? void 0 : _d.question,
                    answer: (_e = answer.question_id) === null || _e === void 0 ? void 0 : _e.answer,
                    startTime: answer === null || answer === void 0 ? void 0 : answer.startTime,
                    endTime: answer === null || answer === void 0 ? void 0 : answer.endTime,
                    totalScore: 0,
                    answers: [],
                };
            }
            else {
                groupedAnswers[questionId].startTime = answer === null || answer === void 0 ? void 0 : answer.startTime;
                groupedAnswers[questionId].endTime = answer === null || answer === void 0 ? void 0 : answer.endTime;
            }
        }
        else {
            if (!groupedAnswers[questionId]) {
                groupedAnswers[questionId] = {
                    question_id: questionId,
                    question: (_f = answer === null || answer === void 0 ? void 0 : answer.question_id) === null || _f === void 0 ? void 0 : _f.question,
                    answer: (_g = answer === null || answer === void 0 ? void 0 : answer.question_id) === null || _g === void 0 ? void 0 : _g.answer,
                    startTime: null,
                    endTime: null,
                    totalScore: 0,
                    answers: [],
                };
            }
            (_j = (_h = groupedAnswers[questionId]) === null || _h === void 0 ? void 0 : _h.answers) === null || _j === void 0 ? void 0 : _j.push({
                answer: answer === null || answer === void 0 ? void 0 : answer.answer,
                _id: answer === null || answer === void 0 ? void 0 : answer._id,
                score: answer === null || answer === void 0 ? void 0 : answer.score,
                judge: {
                    _id: (_k = answer === null || answer === void 0 ? void 0 : answer.judge_id) === null || _k === void 0 ? void 0 : _k._id,
                    name: (_l = answer === null || answer === void 0 ? void 0 : answer.judge_id) === null || _l === void 0 ? void 0 : _l.name,
                    image: (_m = answer === null || answer === void 0 ? void 0 : answer.judge_id) === null || _m === void 0 ? void 0 : _m.image,
                },
                startTime: answer === null || answer === void 0 ? void 0 : answer.startTime,
                endTime: answer === null || answer === void 0 ? void 0 : answer.endTime,
            });
            groupedAnswers[questionId].totalScore += (answer === null || answer === void 0 ? void 0 : answer.score) || 0;
            totalScore += (answer === null || answer === void 0 ? void 0 : answer.score) || 0;
        }
    });
    res.status(200).json({
        success: true,
        result: result,
        totalScore: totalScore,
        questions: Object.values(groupedAnswers),
        msg: "Result details successfully retrieved",
    });
}));
// PATCH || update single score
exports.updateAnswer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { answerId, score } = req.body;
    if (!answerId) {
        res.status(400);
        throw new Error("Answer Id  not found");
    }
    console.log(req.body, "req.body");
    const question = yield answers_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(String(answerId)),
        isDeleted: false,
    });
    const updatedAnswer = yield answers_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(String(answerId)), isDeleted: false }, Object.assign({}, (score && {
        score: Number(score),
    })), { new: true });
    if (!updatedAnswer) {
        res.status(400);
        throw new Error("Answer not updated");
    }
    res.status(200).json({
        success: true,
        msg: "Mark details successfully updated",
    });
}));
