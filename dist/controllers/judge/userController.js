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
exports.getParticipantQuestionsByZone = exports.getParticipantQuestions = exports.answersSubmit = exports.proceedToNextQuestion = exports.proceedToQuestion = exports.getUser = exports.getUsers = void 0;
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
        const searchRegex = new RegExp(search, 'i');
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
        const participantsWithParticipationStatus = yield Promise.all(participants.map((participant) => __awaiter(void 0, void 0, void 0, function* () {
            const existingResult = yield result_1.default.findOne({
                zone: zone,
                participant_id: participant._id,
                isCompleted: true,
            });
            return Object.assign(Object.assign({}, participant === null || participant === void 0 ? void 0 : participant._doc), { hasParticipated: !!existingResult });
        })));
        const total = yield participant_1.default.countDocuments(query);
        return res.status(200).json({
            message: 'Participants fetched successfully',
            currentPage: page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            participants: participantsWithParticipationStatus,
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
                message: 'participant not found',
                success: false,
            });
        }
        return res.status(200).json({
            message: 'participant fetched successfully',
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
                message: 'participant not found.',
            });
        }
        if (participant.zone.toString() != req.judge.zone.toString()) {
            return res.status(400).json({
                message: 'participant and judge zone not same.',
            });
        }
        const result = yield result_1.default.findOne({
            participant_id,
            zone: req.judge.zone,
        });
        if (result) {
            if ((result === null || result === void 0 ? void 0 : result.isCompleted) === false) {
                return res.status(200).json({
                    questionId: result === null || result === void 0 ? void 0 : result.currentQuestion,
                    _id: result === null || result === void 0 ? void 0 : result._id,
                    message: 'Participant has not completed all questions in the bundle.',
                    success: true,
                });
            }
            else {
                return res.status(200).json({
                    message: 'Participant has already completed all questions in the bundle.',
                    success: false,
                });
            }
        }
        else {
            const randomBundle = yield bundle_1.default.aggregate([
                { $match: { isDeleted: false, questions: { $exists: true, $ne: [] } } },
                { $sample: { size: 1 } },
            ]);
            const bundle_id = randomBundle.length > 0 ? randomBundle[0]._id : null;
            const firstQuestion = randomBundle.length > 0 ? (_b = randomBundle[0]) === null || _b === void 0 ? void 0 : _b.questions[0] : null;
            const bundle = yield bundle_1.default.findOne({ _id: bundle_id, isDeleted: false });
            if (!bundle) {
                return res.status(200).json({
                    message: 'Bundle not found',
                    success: false,
                });
            }
            const result = new result_1.default({
                participant_id: participant_id,
                bundle_id,
                startTime,
                zone: req.judge.zone,
                currentQuestion: firstQuestion,
            });
            yield result.save();
            const judges = yield judge_1.default.find({ zone: req.judge.zone, isDeleted: false }, { _id: 1 });
            const answersPromises = judges.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const createdAnswer = yield answers_1.default.findOne({
                    result_id: result === null || result === void 0 ? void 0 : result._id,
                    question_id: firstQuestion,
                    judge_id: item._id,
                });
                if (!createdAnswer) {
                    yield answers_1.default.create({
                        question_id: firstQuestion,
                        result_id: result === null || result === void 0 ? void 0 : result._id,
                        judge_id: item._id,
                        startTime,
                    });
                }
            }));
            yield Promise.all(answersPromises);
            return res.status(200).json({
                message: 'Result saved successfully',
                result: result,
                questionId: firstQuestion,
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
        const { question_id, old_question_id, result_id, startTime, answer_id, isLastSubmit, } = req.body;
        if (!result_id || !startTime) {
            return res.status(400).json({
                message: 'required field not provided',
                success: false,
            });
        }
        const answers = yield answers_1.default.find({
            result_id,
            question_id: old_question_id,
            isCompleted: false,
        }, { judge_id: 1 }).populate('judge_id', 'isMain');
        if (answers) {
            const notSubmitted = answers === null || answers === void 0 ? void 0 : answers.find((answer) => { var _a; return ((_a = answer === null || answer === void 0 ? void 0 : answer.judge_id) === null || _a === void 0 ? void 0 : _a.isMain) === false; });
            if (notSubmitted) {
                return res.status(200).json({
                    message: 'All judges not submitted answer and score',
                    success: false,
                });
            }
        }
        const answerData = yield answers_1.default.findOne({
            result_id,
            question_id,
            judge_id: judge === null || judge === void 0 ? void 0 : judge._id,
            isCompleted: true,
        });
        if (answerData) {
            return res.status(400).json({
                message: 'Answer already submitted',
                success: false,
            });
        }
        if (judge === null || judge === void 0 ? void 0 : judge.isMain) {
            yield answers_1.default.findOneAndUpdate({ _id: answer_id }, { endTime: startTime, isCompleted: true }, { new: true });
        }
        let data;
        if (isLastSubmit) {
            yield result_1.default.findOneAndUpdate({ _id: result_id }, { endTime: startTime, isCompleted: true, currentQuestion: null }, { new: true });
        }
        else {
            const result = yield result_1.default.findOneAndUpdate({ _id: result_id }, { currentQuestion: question_id }, { new: true });
            const judges = yield judge_1.default.find({ zone: req.judge.zone, isDeleted: false }, { _id: 1 });
            const answersPromises = judges.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const createdAnswer = yield answers_1.default.findOne({
                    result_id: result_id,
                    question_id: question_id,
                    judge_id: item._id,
                });
                if (!createdAnswer) {
                    yield answers_1.default.create({
                        question_id,
                        result_id,
                        judge_id: item._id,
                        startTime,
                    });
                }
            }));
            data = yield Promise.all(answersPromises);
        }
        return res.status(200).json({
            message: 'Result saved successfully',
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
    var _a;
    try {
        const answers_dto = (0, class_transformer_1.plainToClass)(answers_2.AnswersDto, (_a = req.body) !== null && _a !== void 0 ? _a : {});
        const error_messages = yield (0, class_validator_1.validate)(answers_dto);
        if (error_messages && error_messages.length > 0) {
            const error = yield (0, handleValidationErrors_1.handleValidationErrors)(res, error_messages);
            throw res.status(404).json({ error });
        }
        const judge = req.judge;
        const { question_id, result_id, answer_id, endTime, answer, score, } = req.body;
        const answerData = yield answers_1.default.findOne({
            result_id,
            question_id,
            judge_id: judge === null || judge === void 0 ? void 0 : judge._id,
            isCompleted: true,
        });
        if (answerData) {
            return res.status(400).json({
                message: 'Answer already submitted',
                success: false,
            });
        }
        const data = yield answers_1.default.findOneAndUpdate({ _id: answer_id }, { endTime, score, answer, isCompleted: true }, { new: true });
        return res.status(200).json({
            message: 'Result saved successfully',
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
                    from: 'bundles',
                    localField: 'bundle_id',
                    foreignField: '_id',
                    as: 'bundle',
                },
            },
            {
                $unwind: {
                    path: '$bundle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'bundle.questions',
                    foreignField: '_id',
                    as: 'questions',
                },
            },
            {
                $unwind: {
                    path: '$questions',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'answers',
                    let: { result_id: '$_id', question_id: '$questions._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$result_id', '$$result_id'] },
                                        { $eq: ['$question_id', '$$question_id'] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'judges',
                                localField: 'judge_id',
                                foreignField: '_id',
                                as: 'judge',
                            },
                        },
                        {
                            $unwind: {
                                path: '$judge',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                answer: 1,
                                score: 1,
                                judge_id: 1,
                                isCompleted: 1,
                                isMain: '$judge.isMain', // Flatten isMain to be part of the submittedAnswers
                            },
                        },
                    ],
                    as: 'submittedAnswers', // Keep all submitted answers as an array
                },
            },
            // Add a lookup for Participant to include name and zone
            {
                $lookup: {
                    from: 'participants',
                    localField: 'participant_id',
                    foreignField: '_id',
                    as: 'participant',
                },
            },
            {
                $unwind: {
                    path: '$participant',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    bundle_id: { $first: '$bundle_id' },
                    participant_id: { $first: '$participant_id' },
                    participant_name: { $first: '$participant.name' },
                    participant_image: { $first: '$participant.image' },
                    questions: {
                        $push: {
                            _id: '$questions._id',
                            question: '$questions.question',
                            answer: '$questions.answer',
                            submittedAnswers: '$submittedAnswers', // Now an array of all answers with flattened isMain
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    bundle_id: 1,
                    participant_id: 1,
                    participant_name: 1,
                    participant_image: 1,
                    questions: 1,
                },
            },
        ]);
        if (result.length === 0) {
            return res.status(404).json({
                message: 'No results found for the participant.',
                success: false,
            });
        }
        return res.status(200).json({
            message: 'Questions fetched successfully',
            success: true,
            data: result[0],
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getParticipantQuestions = getParticipantQuestions;
const getParticipantQuestionsByZone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { zone_id } = req.params;
        // console.log(zone_id, 'zoneId', req.judge)
        const result = yield result_1.default.find({
            zone: new mongoose_1.default.Types.ObjectId(zone_id),
            isCompleted: false,
        });
        const data = yield result_1.default.aggregate([
            {
                $match: {
                    zone: new mongoose_1.default.Types.ObjectId(zone_id),
                    isDeleted: false,
                    isCompleted: false,
                },
            },
            {
                $lookup: {
                    from: 'answers',
                    let: { result_id: '$_id', judge_id: (_a = req === null || req === void 0 ? void 0 : req.judge) === null || _a === void 0 ? void 0 : _a._id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$result_id', '$$result_id'] },
                                        { $eq: ['$judge_id', '$$judge_id'] },
                                        { $eq: ['$isCompleted', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'answers',
                },
            },
        ]);
        return res.status(200).json({
            message: 'Result fetched successfully',
            success: true,
            data: data,
        });
    }
    catch (error) {
        console.log(error, 'error');
        next(error);
    }
});
exports.getParticipantQuestionsByZone = getParticipantQuestionsByZone;
