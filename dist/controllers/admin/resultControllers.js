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
exports.getSingleResultsDetails = exports.getResultsDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const result_1 = __importDefault(require("../../models/result"));
// GET || get Result details
exports.getResultsDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const searchData = req.query.search || "";
    const zones = req.query.zones || "";
    const query = { isDeleted: false };
    if (searchData !== "") {
        query.participant.name = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }
    if (zones !== "") {
        query.zone = { $in: zones };
    }
    const results = yield result_1.default.find(query)
        .populate("zone")
        .populate("participant")
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalDocuments = yield result_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        results: results || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: "Result details successfully retrieved",
    });
}));
// GET || get single Result details
exports.getSingleResultsDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resultId } = req.params;
    if (!resultId) {
        res.status(400);
        throw new Error("resultId is required");
    }
    const result = yield result_1.default.findOne({ _id: resultId, isDeleted: false })
        .populate("zone")
        .populate("participant")
        .populate({
        path: "results",
        populate: [
            {
                path: "question",
                model: "Question",
            },
            {
                path: "responses.judge",
                model: "Judge",
            },
        ],
    });
    if (!result) {
        res.status(400);
        throw new Error("Result not found");
    }
    res.status(200).json({
        success: true,
        result: result,
        msg: "Result details successfully retrieved",
    });
}));
