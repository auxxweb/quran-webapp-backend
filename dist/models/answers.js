"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const answersSchema = new mongoose_1.default.Schema({
    question_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    result_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Result",
        required: true,
    },
    judge_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Judge",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    score: {
        type: Number,
    },
    answer: {
        type: String,
    },
    isCompleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true,
});
const Answer = mongoose_1.default.model("answers", answersSchema);
exports.default = Answer;
