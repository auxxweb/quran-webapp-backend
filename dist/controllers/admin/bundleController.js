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
exports.getSingleBundleDetails = exports.getBundleDetails = exports.deleteBundleDetails = exports.updateBundleDetails = exports.uploadBundleDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bundle_1 = __importDefault(require("../../models/bundle"));
const app_utils_1 = require("../../utils/app.utils");
exports.uploadBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questions, title } = req.body;
    if (!questions || !title) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${title}$`);
    const existBundle = yield bundle_1.default.findOne({
        title: { $regex: regExp, $options: "" },
        isDeleted: false,
    });
    if (existBundle) {
        res.status(400);
        throw new Error(`This bundle title already exists`);
    }
    const bundle = yield bundle_1.default.create(Object.assign(Object.assign({}, req.body), { bundleId: yield (0, app_utils_1.createBundleId)() }));
    if (!bundle) {
        res.status(400);
        throw new Error("Bundle upload failed");
    }
    res.status(201).json({
        success: true,
        msg: "Bundle details successfully uploaded",
    });
}));
// PATCH || update Bundle details
exports.updateBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bundleId, title } = req.body;
    if (!bundleId) {
        res.status(400);
        throw new Error("Bundle Id  not found");
    }
    if (title) {
        const bundle = yield bundle_1.default.findOne({
            _id: bundleId,
            isDeleted: false,
        });
        if (!bundle) {
            res.status(404);
            throw new Error("Bundle not found");
        }
        if (bundle.title !== title) {
            const regExp = new RegExp(`^${title}$`);
            const existBundle = yield bundle_1.default.findOne({
                title: { $regex: regExp, $options: "" },
                isDeleted: false,
            });
            if (existBundle) {
                res.status(400);
                throw new Error("This bundle title already exists");
            }
        }
    }
    const updatedBundle = yield bundle_1.default.findOneAndUpdate({ _id: bundleId, isDeleted: false }, req.body, { new: true });
    if (!updatedBundle) {
        res.status(400);
        throw new Error("Bundle not updated");
    }
    res.status(200).json({
        success: true,
        msg: "Bundle details successfully updated",
    });
}));
// DELETE ||  delete Bundle details
exports.deleteBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bundleId } = req.query;
    if (!bundleId) {
        res.status(400);
        throw new Error("bundleId not found");
    }
    const bundle = yield bundle_1.default.findByIdAndUpdate({ _id: bundleId }, {
        isDeleted: true,
    }, { new: true });
    if (!bundle) {
        res.status(400);
        throw new Error("Deletion failed");
    }
    res.status(200).json({
        success: true,
        msg: `${bundle === null || bundle === void 0 ? void 0 : bundle.bundleId} successfully deleted`,
    });
}));
// GET || get Bundle details
exports.getBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const searchData = req.query.search || "";
    const query = { isDeleted: false };
    if (searchData !== "") {
        query.bundleId = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }
    const bundles = yield bundle_1.default.find(query).populate({
        path: 'questions',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 } }, // Sort by createdAt in ascending order (oldest first)
    })
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalDocuments = yield bundle_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        bundles: bundles || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: "Bundles details successfully retrieved",
    });
}));
// GET || get single Bundle details
exports.getSingleBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bundleId } = req.params;
    if (!bundleId) {
        res.status(400);
        throw new Error("bundleId is required");
    }
    const bundle = yield bundle_1.default.findOne({ _id: bundleId, isDeleted: false })
        .populate({
        path: 'questions',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 } }, // Sort by createdAt in ascending order (oldest first)
    });
    if (!bundle) {
        res.status(400);
        throw new Error("Bundle not found");
    }
    res.status(200).json({
        success: true,
        bundle: bundle,
        msg: "Bundle details successfully retrieved",
    });
}));
