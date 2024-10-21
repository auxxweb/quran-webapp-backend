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
exports.getSingleResultsDetails = exports.getResultsDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const result_1 = __importDefault(require("../../models/result"));
const answers_1 = __importDefault(require("../../models/answers"));
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
    // Fetch the result
    const result = yield result_1.default.findOne({
        _id: resultId,
        isDeleted: false,
        isCompleted: true,
    })
        .populate("zone", "_id name ")
        .populate("participant_id", "_id name image email phone address");
    if (!result) {
        res.status(400);
        throw new Error("Result not found");
    }
    // Fetch the answers for the given result
    const answers = yield answers_1.default.find({
        result_id: resultId,
        isCompleted: true,
    })
        .populate("question_id", "_id name ")
        .populate("judge_id", "_id name image isMain");
    const groupedAnswers = {};
    let totalScore = 0;
    answers.forEach((answer) => {
        if (answer.judge_id.isMain) {
            if (!groupedAnswers[answer.question_id._id]) {
                groupedAnswers[answer.question_id._id] = {
                    question_id: answer.question_id._id,
                    question_name: answer.question_id.name,
                    startTime: answer.startTime,
                    endTime: answer.endTime,
                    totalScore: 0,
                    answers: [],
                };
            }
        }
        else {
            if (!groupedAnswers[answer.question_id._id]) {
                groupedAnswers[answer.question_id._id] = {
                    question_id: answer.question_id._id,
                    question_name: answer.question_id.name,
                    startTime: null,
                    endTime: null,
                    totalScore: 0,
                    answers: [],
                };
            }
            groupedAnswers[answer.question_id._id].answers.push({
                answer: answer.answer,
                score: answer.score,
                judge: {
                    _id: answer.judge_id._id,
                    name: answer.judge_id.name,
                    image: answer.judge_id.image,
                },
                startTime: answer.startTime,
                endTime: answer.endTime,
            });
            groupedAnswers[answer.question_id._id].totalScore += answer.score || 0;
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
