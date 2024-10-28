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
exports.getQuestion = exports.getUser = exports.getZoneDetails = void 0;
const participant_1 = __importDefault(require("../../models/participant"));
const mongoose_1 = __importDefault(require("mongoose"));
const result_1 = __importDefault(require("../../models/result"));
const zones_1 = __importDefault(require("../../models/zones"));
const getZoneDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(id, "id");
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Question or Result ID",
                success: false,
            });
        }
        const zone = yield zones_1.default.findOne({ _id: id, isDeleted: false }, { name: 1 });
        if (!zone) {
            return res.status(200).json({
                message: "Zone not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "zone fetched successfully",
            zone: zone,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getZoneDetails = getZoneDetails;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid participant ID",
                success: false,
            });
        }
        const participant = yield participant_1.default.findOne({ _id: id, isDeleted: false }, { name: 1, image: 1, zone: 1 }).populate('zone', 'name');
        if (!participant) {
            return res.status(404).json({
                message: "Participant not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Participant fetched successfully",
            participant: participant,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
const getQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { questionId, resultId } = req.params;
        // Validate IDs
        if (!mongoose_1.default.Types.ObjectId.isValid(questionId) ||
            !mongoose_1.default.Types.ObjectId.isValid(resultId)) {
            return res.status(400).json({
                message: "Invalid Question or Result ID",
                success: false,
            });
        }
        // Find and populate necessary fields
        const result = yield result_1.default.findOne({ _id: resultId, isDeleted: false })
            .populate("zone", "name")
            .populate("participant_id", "name image")
            .populate({
            path: "bundle_id",
            populate: {
                path: "questions",
                select: "question", // Populate only the question field
            },
        });
        if (!result) {
            return res.status(404).json({
                message: "Result not found",
                success: false,
            });
        }
        (_b = (_a = result === null || result === void 0 ? void 0 : result.bundle_id) === null || _a === void 0 ? void 0 : _a.questions) === null || _b === void 0 ? void 0 : _b.sort((a, b) => { var _a, _b; return (_b = (_a = a === null || a === void 0 ? void 0 : a._id) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.localeCompare(b === null || b === void 0 ? void 0 : b._id.toString()); });
        const questionIndex = result.bundle_id.questions.findIndex((question) => question._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({
                message: "Question not found in the bundle",
                success: false,
            });
        }
        // Get the matched question
        const matchingQuestion = result.bundle_id.questions[questionIndex];
        // Send response with the question number based on the sorted order
        return res.status(200).json({
            message: "Question fetched successfully",
            result: {
                question: matchingQuestion,
                questionNumber: questionIndex + 1,
                zone: result.zone,
                participant: result.participant_id,
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getQuestion = getQuestion;
