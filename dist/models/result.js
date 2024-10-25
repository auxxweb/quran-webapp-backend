"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const resultSchema = new mongoose_1.default.Schema({
    zone: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true,
    },
    earliestSubmittedAt: {
        type: String,
    },
    participant_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Participant',
        required: true,
    },
    bundle_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Bundle',
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    currentQuestion: {
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
}, { timestamps: true });
const Result = mongoose_1.default.model('Result', resultSchema);
exports.default = Result;
