"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const noticeSchema = new mongoose_1.Schema({
    description: {
        type: String,
        require: true,
    },
}, { timestamps: true });
const Notice = (0, mongoose_1.model)("Notice", noticeSchema);
exports.default = Notice;
