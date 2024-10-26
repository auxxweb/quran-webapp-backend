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
    var _a, _b, _c, _d;
    try {
        const { questionId, resultId } = req.params;
        // Check if the IDs are valid ObjectIds
        if (!mongoose_1.default.Types.ObjectId.isValid(questionId) || !mongoose_1.default.Types.ObjectId.isValid(resultId)) {
            return res.status(400).json({
                message: "Invalid Question or Result ID",
                success: false,
            });
        }
        // Find the result, populate zone, participant, and bundle with the full question details
        const result = yield result_1.default.findOne({ _id: resultId, isDeleted: false })
            .populate("zone", "name")
            .populate("participant_id", "name image")
            .populate({
            path: "bundle_id",
            populate: {
                path: "questions", select: "question" // Fully populate questions within bundle
            },
        });
        if (!result) {
            return res.status(404).json({
                message: "Result not found",
                success: false,
            });
        }
        console.log((_a = result === null || result === void 0 ? void 0 : result.bundle_id) === null || _a === void 0 ? void 0 : _a.questions, "result?.bundle_id?.questions");
        // Find the index of the question in the populated bundle that matches questionId
        const questionIndex = (_c = (_b = result === null || result === void 0 ? void 0 : result.bundle_id) === null || _b === void 0 ? void 0 : _b.questions) === null || _c === void 0 ? void 0 : _c.findIndex((question) => (question === null || question === void 0 ? void 0 : question._id.toString()) === questionId);
        // Check if the question was found in the array
        if (questionIndex === -1) {
            return res.status(404).json({
                message: "Question not found in the bundle",
                success: false,
            });
        }
        // Get the question at the found index
        const matchingQuestion = (_d = result === null || result === void 0 ? void 0 : result.bundle_id) === null || _d === void 0 ? void 0 : _d.questions[questionIndex];
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
