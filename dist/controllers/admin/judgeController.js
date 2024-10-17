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
exports.getSingleJudgeDetails = exports.updatePassword = exports.blockOrUnblock = exports.getJudgeDetails = exports.deletejudgeDetails = exports.updateJudgeDetails = exports.uploadJudgeDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const judge_1 = __importDefault(require("../../models/judge"));
const crypto_1 = __importDefault(require("crypto"));
exports.uploadJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, phone, address, gender, zone, isMain } = req.body;
    const { image } = (req === null || req === void 0 ? void 0 : req.files) || {};
    const imageUrl = image && ((_a = image[0]) === null || _a === void 0 ? void 0 : _a.location);
    if (!name ||
        !email ||
        !phone ||
        !address ||
        !gender ||
        !zone ||
        !imageUrl) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const existJudge = yield judge_1.default.findOne({
        email,
        isDeleted: false,
    });
    if (existJudge) {
        res.status(400);
        throw new Error(`${email}  already exists`);
    }
    if (isMain === true) {
        const mainJudge = yield judge_1.default.findOne({
            zone: zone,
            isMain: true,
            isDeleted: false,
        });
        if (mainJudge) {
            res.status(400);
            throw new Error(`A main judge already exists in this zone`);
        }
    }
    const plainPassword = crypto_1.default.randomBytes(4).toString("hex").slice(0, 8);
    const judge = yield judge_1.default.create(Object.assign(Object.assign({}, req.body), { password: plainPassword, image: imageUrl }));
    if (!judge) {
        res.status(400);
        throw new Error("Judge upload failed");
    }
    res.status(201).json({
        success: true,
        msg: "Judge details successfully uploaded",
    });
}));
// PATCH || update Judge details
exports.updateJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { judgeId, email, isMain, zone } = req.body;
    const { image } = req.files || {};
    const imageUrl = image && ((_a = image[0]) === null || _a === void 0 ? void 0 : _a.location);
    if (!judgeId) {
        res.status(400);
        throw new Error("Judge Id  not found");
    }
    if (email) {
        const judge = yield judge_1.default.findOne({
            _id: judgeId,
            isDeleted: false,
        });
        if (!judge) {
            res.status(404);
            throw new Error("Judge not found");
        }
        if (judge.email !== email) {
            const existJudge = yield judge_1.default.findOne({
                email,
                isDeleted: false,
            });
            if (existJudge) {
                res.status(400);
                throw new Error("This email already used");
            }
        }
    }
    if (isMain === true && zone) {
        const mainJudge = yield judge_1.default.findOne({
            zone: zone,
            isMain: true,
            isDeleted: false,
            _id: { $ne: judgeId },
        }).populate("zone");
        if (mainJudge) {
            res.status(400);
            throw new Error(`A main judge already exists in zone ${(_b = mainJudge === null || mainJudge === void 0 ? void 0 : mainJudge.zone) === null || _b === void 0 ? void 0 : _b.name}`);
        }
    }
    const updatedJudge = yield judge_1.default.findOneAndUpdate({ _id: judgeId, isDeleted: false }, Object.assign(Object.assign({}, req.body), { image: imageUrl && imageUrl }), { new: true });
    if (!updatedJudge) {
        res.status(400);
        throw new Error("Judge not updated");
    }
    res.status(200).json({
        success: true,
        msg: "Judge details successfully updated",
    });
}));
// DELETE ||  delete judge details
exports.deletejudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId } = req.query;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
    }
    const judge = yield judge_1.default.findByIdAndUpdate({ _id: judgeId }, {
        isDeleted: true,
    }, { new: true });
    if (!judge) {
        res.status(400);
        throw new Error("Deletion failed");
    }
    res.status(200).json({
        success: true,
        msg: `${judge === null || judge === void 0 ? void 0 : judge.name} successfully deleted`,
    });
}));
// GET || get judge details
exports.getJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const searchData = req.query.search || "";
    const zones = req.query.zones || "";
    const status = req.query.status || "";
    const query = { isDeleted: false };
    if (searchData !== "") {
        query.name = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }
    if (zones !== "") {
        query.zone = { $in: zones };
    }
    if (status !== "") {
        query.isBlocked = status;
    }
    const judge = yield judge_1.default.find(query)
        .populate("zone")
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalDocuments = yield judge_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        judge: judge || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: "Judge details successfully retrieved",
    });
}));
// PATCH ||  block or unblock judge details
exports.blockOrUnblock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId } = req.query;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
    }
    const judge = yield judge_1.default.findOne({ _id: judgeId }, {
        isBlocked: 1,
    });
    if (!judge) {
        res.status(400);
        throw new Error("Updation failed");
    }
    let msg = "";
    if ((judge === null || judge === void 0 ? void 0 : judge.isBlocked) === true) {
        msg = `${judge === null || judge === void 0 ? void 0 : judge.name} successfully unblocked`;
        judge.isBlocked = false;
    }
    else {
        msg = `${judge === null || judge === void 0 ? void 0 : judge.name} successfully blocked`;
        judge.isBlocked = true;
    }
    yield judge.save();
    res.status(200).json({
        success: true,
        msg,
    });
}));
// PATCH ||  update judge password details
exports.updatePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId, password } = req.query;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId not found");
    }
    const judge = yield judge_1.default.findByIdAndUpdate({ _id: judgeId }, {
        password: password,
    }, { new: true });
    if (!judge) {
        res.status(400);
        throw new Error("Password updation failed");
    }
    res.status(200).json({
        success: true,
        msg: `${judge === null || judge === void 0 ? void 0 : judge.name}'s password successfully updated`,
    });
}));
// GET || get single Judge details
exports.getSingleJudgeDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { judgeId } = req.params;
    if (!judgeId) {
        res.status(400);
        throw new Error("judgeId is required");
    }
    const judge = yield judge_1.default.findOne({
        _id: judgeId,
        isDeleted: false,
    }).populate("zone");
    if (!judge) {
        res.status(400);
        throw new Error("Judge not found");
    }
    res.status(200).json({
        success: true,
        judge: judge,
        msg: "Judge details successfully retrieved",
    });
}));
