"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
        default: null,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["Client", "Admin", "Student", "Teacher"],
        required: true,
    },
    notifications: {
        type: Array,
        default: [],
    },
    seenNotifications: {
        type: Array,
        default: [],
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
