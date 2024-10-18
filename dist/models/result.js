"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const resultSchema = new mongoose_1.default.Schema({
    zone: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Zone" },
    participant: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Participant" },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    results: [
        {
            question: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Question" },
            startTime: {
                type: Date,
            },
            endTime: {
                type: Date,
            },
            responses: [
                {
                    judge: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Judge" },
                    score: {
                        type: Number,
                    },
                    answer: {
                        type: String,
                    },
                },
            ],
        },
    ],
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const Result = mongoose_1.default.model("Result", resultSchema);
exports.default = Result;