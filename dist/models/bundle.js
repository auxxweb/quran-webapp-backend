"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bundleSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    questions: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Question" }],
    bundleId: {
        required: true,
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const Bundle = mongoose_1.default.model("Bundle", bundleSchema);
exports.default = Bundle;
