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
exports.getSingleQuestionDetails = exports.getAllQuestionsNames = exports.getQuestionDetails = exports.deleteQuestionDetails = exports.updateQuestionDetails = exports.uploadQuestionDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const question_1 = __importDefault(require("../../models/question"));
const app_utils_1 = require("../../utils/app.utils");
exports.uploadQuestionDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question, answer } = req.body;
    if (!question || !answer) {
        res.status(400);
        throw new Error('Please enter all the fields');
    }
    const regExp = new RegExp(`^${question}$`);
    const existQuestion = yield question_1.default.findOne({
        question: { $regex: regExp, $options: '' },
        isDeleted: false,
    });
    if (existQuestion) {
        res.status(400);
        throw new Error(`This question already exists`);
    }
    const newQuestion = yield question_1.default.create(Object.assign(Object.assign({}, req.body), { questionId: yield (0, app_utils_1.createQuestionId)() }));
    if (!newQuestion) {
        res.status(400);
        throw new Error('Question upload failed');
    }
    res.status(201).json({
        success: true,
        msg: 'Question details successfully uploaded',
    });
}));
// PATCH || update Question details
exports.updateQuestionDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId, question } = req.body;
    if (!questionId) {
        res.status(400);
        throw new Error('Question Id  not found');
    }
    if (question) {
        const existingQuestion = yield question_1.default.findOne({
            _id: questionId,
            isDeleted: false,
        });
        if (!existingQuestion) {
            res.status(404);
            throw new Error('Zone not found');
        }
        if (existingQuestion.question !== question) {
            const regExp = new RegExp(`^${question}$`);
            const existQuestion = yield question_1.default.findOne({
                question: { $regex: regExp, $options: '' },
                isDeleted: false,
            });
            if (existQuestion) {
                res.status(400);
                throw new Error('This Question already exists');
            }
        }
    }
    const updatedQuestion = yield question_1.default.findOneAndUpdate({ _id: questionId, isDeleted: false }, req.body, { new: true });
    if (!updatedQuestion) {
        res.status(400);
        throw new Error('Question not updated');
    }
    res.status(200).json({
        success: true,
        msg: 'Question details successfully updated',
    });
}));
// DELETE ||  delete question details
exports.deleteQuestionDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.query;
    if (!questionId) {
        res.status(400);
        throw new Error('questionId not found');
    }
    const question = yield question_1.default.findByIdAndUpdate({ _id: questionId }, {
        isDeleted: true,
    }, { new: true });
    if (!question) {
        res.status(400);
        throw new Error('Deletion failed');
    }
    res.status(200).json({
        success: true,
        msg: `${question === null || question === void 0 ? void 0 : question.questionId} successfully deleted`,
    });
}));
// GET || get Question details
exports.getQuestionDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    let query = { isDeleted: false };
    const searchTerm = req.query.search || '';
    if (searchTerm) {
        console.log(searchTerm, 'searchTerm');
        // Normalize and escape searchTerm
        const normalizedSearchTerm = String(searchTerm).normalize('NFC');
        const escapedSearchTerm = normalizedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
        console.log(normalizedSearchTerm, 'normalized', escapedSearchTerm, 'escaped');
        // Add regex conditions if escapedSearchTerm is not empty
        if (escapedSearchTerm) {
            query = Object.assign(Object.assign({}, query), { $or: [
                    {
                        question: {
                            $regex: new RegExp(escapedSearchTerm, 'i'),
                        },
                    },
                    {
                        questionId: {
                            $regex: new RegExp(escapedSearchTerm, 'i'),
                        },
                    },
                ] });
        }
    }
    // Log the final query for debugging
    console.log(query.$or, 'Final Query');
    // Set collation based on the detected language
    const locale = /^[\u0600-\u06FF]/.test(searchTerm)
        ? 'ar'
        : /^[\u0D00-\u0D7F]/.test(searchTerm)
            ? 'ml'
            : 'en';
    const questions = yield question_1.default.find(query)
        .collation({ locale, strength: 2 }) // Use appropriate collation for the detected language
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalDocuments = yield question_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        questions: questions || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: 'Questions details successfully retrieved',
    });
}));
// GET || get question  and ids
exports.getAllQuestionsNames = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield question_1.default.find({ isDeleted: false }, { question: 1, questionId: 1 });
    res.status(200).json({
        success: true,
        questions: questions || [],
        msg: 'Question details successfully retrieved',
    });
}));
// GET || get single Question details
exports.getSingleQuestionDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId } = req.params;
    if (!questionId) {
        res.status(400);
        throw new Error('questionId is required');
    }
    const question = yield question_1.default.findOne({
        _id: questionId,
        isDeleted: false,
    });
    if (!question) {
        res.status(400);
        throw new Error('Question not found');
    }
    res.status(200).json({
        success: true,
        question: question,
        msg: 'Question details successfully retrieved',
    });
}));
