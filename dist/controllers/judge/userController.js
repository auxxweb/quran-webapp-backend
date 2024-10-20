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
exports.getParticipantQuestions = exports.answersSubmit = exports.proceedToNextQuestion = exports.proceedToQuestion = exports.getUser = exports.getUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const participant_1 = __importDefault(require("../../models/participant"));
const result_1 = __importDefault(require("../../models/result"));
const answers_1 = __importDefault(require("../../models/answers"));
const bundle_1 = __importDefault(require("../../models/bundle"));
const handleValidationErrors_1 = require("../../utils/handleValidationErrors");
const resultDto_1 = require("../../dto/resultDto");
const answers_2 = require("../../dto/answers");
const judge_1 = __importDefault(require("../../models/judge"));
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPage = 1, pageSize = 10, search } = req.query;
        const page = parseInt(currentPage) || 1;
        const limit = parseInt(pageSize) || 10;
        const skip = (page - 1) * limit;
        const zone = req.judge.zone;
        const searchRegex = new RegExp(search, "i");
        const query = {
            $and: [
                { zone },
                {
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex },
                        { address: searchRegex },
                    ],
                },
            ],
        };
        const participants = yield participant_1.default.find(query).skip(skip).limit(limit);
        const total = yield participant_1.default.countDocuments(query);
        return res.status(200).json({
            message: "Participants fetched successfully",
            currentPage: page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            participants,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const participant = yield participant_1.default.findOne({ _id: req.params.id });
        if (!participant) {
            return res.status(404).json({
                message: "participant not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "participant fetched successfully",
            participant: participant,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
const proceedToQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const result_dto = (0, class_transformer_1.plainToClass)(resultDto_1.ResultDto, (_a = req.body) !== null && _a !== void 0 ? _a : {});
        const error_messages = yield (0, class_validator_1.validate)(result_dto);
        if (error_messages && error_messages.length > 0) {
            const error = yield (0, handleValidationErrors_1.handleValidationErrors)(res, error_messages);
            throw res.status(401).json({ error });
        }
        const { participant_id, startTime } = req.body;
        const participant = yield participant_1.default.findOne({ _id: participant_id });
        if (participant == null) {
            return res.status(400).json({
                message: "participant not found.",
            });
        }
        if (participant.zone.toString() != req.judge.zone.toString()) {
            return res.status(400).json({
                message: "participant and judge zone not same.",
            });
        }
        const aggregationResult = yield result_1.default.aggregate([
            {
                $match: { participant_id: new mongoose_1.default.Types.ObjectId(participant_id) },
            },
            {
                $lookup: {
                    from: "bundles",
                    localField: "bundle_id",
                    foreignField: "_id",
                    as: "bundle",
                },
            },
            {
                $unwind: {
                    path: "$bundle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "answers",
                    localField: "_id",
                    foreignField: "result_id",
                    as: "answeredQuestions",
                },
            },
            {
                $unwind: "$answeredQuestions",
            },
            {
                $group: {
                    _id: "$_id",
                    uniqueAnsweredQuestions: {
                        $addToSet: "$answeredQuestions.question_id", // Set of unique answered question IDs
                    },
                    questionCount: { $first: { $size: "$bundle.questions" } }, // Total questions in the bundle
                },
            },
            {
                $addFields: {
                    answeredCount: { $size: "$uniqueAnsweredQuestions" }, // Count of unique answered questions
                },
            },
            {
                $project: {
                    _id: 1,
                    bundle_id: 1,
                    questionCount: 1,
                    answeredCount: 1,
                },
            },
        ]);
        console.log(aggregationResult, "aggregationResult");
        if (aggregationResult.length > 0) {
            const { questionCount, answeredCount, _id } = aggregationResult[0];
            if (answeredCount < questionCount) {
                return res.status(200).json({
                    questionCount,
                    answeredCount,
                    _id: _id,
                    message: "Participant has not completed all questions in the bundle.",
                    success: true,
                });
            }
            else {
                return res.status(200).json({
                    message: "Participant has already completed all questions in the bundle.",
                    success: false,
                });
            }
        }
        else {
            const randomBundle = yield bundle_1.default.aggregate([
                { $match: { isDeleted: false } }, // Filter out deleted bundles
                { $sample: { size: 1 } }, // Sample one random bundle
            ]);
            const bundle_id = randomBundle.length > 0 ? randomBundle[0]._id : null;
            const firstQuestion = randomBundle.length > 0 ? (_b = randomBundle[0]) === null || _b === void 0 ? void 0 : _b.questions[0] : null;
            const bundle = yield bundle_1.default.findOne({ _id: bundle_id, isDeleted: false });
            if (!bundle) {
                return res.status(200).json({
                    message: "Bundle not found",
                    success: false,
                });
            }
            const result = new result_1.default({
                participant_id: participant_id,
                bundle_id,
                startTime,
                zone: req.judge.zone,
            });
            yield result.save();
            const judges = yield judge_1.default.find({ zone: req.judge.zone, isDeleted: false, isMain: false }, { _id: 1 });
            const answersPromises = judges.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const createdAnswer = yield answers_1.default.create({
                    question_id: firstQuestion,
                    result_id: result === null || result === void 0 ? void 0 : result._id,
                    judge_id: item._id,
                    startTime,
                });
            }));
            yield Promise.all(answersPromises);
            return res.status(200).json({
                message: "Result saved successfully",
                result: result,
                success: true,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.proceedToQuestion = proceedToQuestion;
const proceedToNextQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const judge = req.judge;
        const { question_id, result_id, startTime } = req.body;
        if (!question_id || !result_id || !startTime) {
            return res.status(400).json({
                message: "required field not provided",
                success: false,
            });
        }
        console.log(req.body, "req.body");
        const answerData = yield answers_1.default.findOne({
            result_id,
            question_id,
            judge_id: judge === null || judge === void 0 ? void 0 : judge._id,
            isCompleted: true,
        });
        if (answerData) {
            return res.status(400).json({
                message: "Answer already submitted",
                success: false,
            });
        }
        const judges = yield judge_1.default.find({ zone: req.judge.zone, isDeleted: false, isMain: false }, { _id: 1 });
        const answersPromises = judges.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const createdAnswer = yield answers_1.default.create({
                question_id,
                result_id,
                judge_id: item._id,
                startTime,
            });
        }));
        const data = yield Promise.all(answersPromises);
        // const data = new Answer({
        //   question_id,
        //   result_id,
        //   startTime,
        //   judge_id: req.judge._id,
        // });
        // data.save();
        return res.status(200).json({
            message: "Result saved successfully",
            result: data,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.proceedToNextQuestion = proceedToNextQuestion;
const answersSubmit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const answers_dto = (0, class_transformer_1.plainToClass)(answers_2.AnswersDto, (_c = req.body) !== null && _c !== void 0 ? _c : {});
        const error_messages = yield (0, class_validator_1.validate)(answers_dto);
        if (error_messages && error_messages.length > 0) {
            const error = yield (0, handleValidationErrors_1.handleValidationErrors)(res, error_messages);
            throw res.status(401).json({ error });
        }
        const judge = req.judge;
        const { question_id, result_id, answer_id, endTime, answer, score } = req.body;
        const answerData = yield answers_1.default.findOne({
            result_id,
            question_id,
            judge_id: judge === null || judge === void 0 ? void 0 : judge._id,
            isCompleted: true,
        });
        if (answerData) {
            return res.status(400).json({
                message: "Answer already submitted",
                success: false,
            });
        }
        const data = yield answers_1.default.findOneAndUpdate({ _id: answer_id }, { endTime, score, answer, isCompleted: true }, { new: true });
        // const data = new Answer({
        //   question_id,
        //   result_id,
        //   judge_id: req.judge._id,
        //   startTime,
        //   endTime,
        //   score,
        //   answer,
        // });
        // data.save();
        return res.status(200).json({
            message: "Result saved successfully",
            result: data,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.answersSubmit = answersSubmit;
const getParticipantQuestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { result_id } = req.params;
        const result = yield result_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(result_id),
                },
            },
            {
                $lookup: {
                    from: "bundles",
                    localField: "bundle_id",
                    foreignField: "_id",
                    as: "bundle",
                },
            },
            {
                $unwind: {
                    path: "$bundle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "bundle.questions",
                    foreignField: "_id",
                    as: "questions",
                },
            },
            {
                $unwind: {
                    path: "$questions",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "answers",
                    let: { result_id: "$_id", question_id: "$questions._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$result_id", "$$result_id"] },
                                        { $eq: ["$question_id", "$$question_id"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                answer: 1,
                                score: 1,
                                judge_id: 1,
                                isCompleted: 1,
                            },
                        },
                    ],
                    as: "submittedAnswers", // Keep all submitted answers as an array
                },
            },
            {
                $group: {
                    _id: "$_id",
                    bundle_id: { $first: "$bundle_id" },
                    questions: {
                        $push: {
                            _id: "$questions._id",
                            question: "$questions.question",
                            answer: "$questions.answer",
                            submittedAnswers: "$submittedAnswers", // Now an array of all answers
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    bundle_id: 1,
                    questions: 1,
                },
            },
        ]);
        if (result.length === 0) {
            return res.status(404).json({
                message: "No results found for the participant.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Questions fetched successfully",
            success: true,
            data: result[0],
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getParticipantQuestions = getParticipantQuestions;
