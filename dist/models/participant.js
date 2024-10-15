"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const participantSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    zone: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Zone" },
    email: {
        required: true,
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const Participant = mongoose_1.default.model("Participant", participantSchema);
exports.default = Participant;
