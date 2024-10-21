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
exports.getDashboardDetails = exports.updatePassword = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const admin_1 = __importDefault(require("../../models/admin"));
const participant_1 = __importDefault(require("../../models/participant"));
const judge_1 = __importDefault(require("../../models/judge"));
const zones_1 = __importDefault(require("../../models/zones"));
// PATCH ||  update admin password details
exports.updatePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, password } = req.body;
    const admin = req.admin;
    if (!admin) {
        res.status(400);
        throw new Error("admin not found");
    }
    const isMatch = yield bcryptjs_1.default.compare(oldPassword, (_a = admin === null || admin === void 0 ? void 0 : admin.password) !== null && _a !== void 0 ? _a : "");
    if (!isMatch) {
        res.status(400);
        throw new Error("Incorrect Password!");
    }
    const salt = yield bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password.trim(), salt);
    const updatedAdmin = yield admin_1.default.findByIdAndUpdate({ _id: admin === null || admin === void 0 ? void 0 : admin._id }, {
        password: hashedPassword,
    }, { new: true });
    if (!updatedAdmin) {
        res.status(400);
        throw new Error("Password updation failed");
    }
    res.status(200).json({
        success: true,
        msg: `admin's password successfully updated`,
    });
}));
exports.getDashboardDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = yield participant_1.default.countDocuments({ isDeleted: false });
    const judges = yield judge_1.default.countDocuments({ isDeleted: false });
    const zones = yield zones_1.default.countDocuments({ isDeleted: false });
    const zoneBasedParticipants = yield zones_1.default.aggregate([
        {
            $match: { isDeleted: false },
        },
        {
            $lookup: {
                from: "participants",
                localField: "_id",
                foreignField: "zone",
                as: "participants",
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                count: {
                    $size: {
                        $filter: {
                            input: "$participants",
                            as: "participant",
                            cond: { $eq: ["$$participant.isDeleted", false] },
                        },
                    },
                },
            },
        },
        {
            $project: {
                id: "$_id",
                label: "$name",
                count: 1,
            },
        },
    ]);
    res.status(200).json({
        data: {
            participants,
            judges,
            zones,
            zoneBasedParticipants: zoneBasedParticipants.length === 0 ? [] : zoneBasedParticipants,
        },
        success: true,
        msg: `admin's dashboard details fetched successfully `,
    });
}));
