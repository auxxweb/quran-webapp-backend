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
exports.getZoneDetails = exports.deleteZoneDetails = exports.updateZoneDetails = exports.uploadZoneDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const uniqid_1 = __importDefault(require("uniqid"));
const store_1 = __importDefault(require("store"));
const zones_1 = __importDefault(require("../../models/zones"));
exports.uploadZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image } = req.body;
    if (!name || !description || !image) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${name}$`);
    const existZone = yield zones_1.default.findOne({
        name: { $regex: regExp, $options: "" }, isDeleted: false
    });
    if (existZone) {
        res.status(400);
        throw new Error(`${name} zone already exists`);
    }
    let tx_uuid = (0, uniqid_1.default)();
    store_1.default.set("uuid", { tx: tx_uuid });
    const zone = yield zones_1.default.create(Object.assign(Object.assign({}, req.body), { url: `/${name}/${tx_uuid}` }));
    if (!zone) {
        res.status(400);
        throw new Error("Zone upload failed");
    }
    res.status(201).json({
        success: true,
        msg: "Zone details successfully uploaded",
    });
}));
// PATCH || update Zone details
exports.updateZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { zoneId, name } = req.body;
    if (!zoneId) {
        res.status(400);
        throw new Error("Zone Id  not found");
    }
    if (name) {
        const zone = yield zones_1.default.findOne({
            _id: zoneId,
            isDeleted: false,
        });
        if (!zone) {
            res.status(404);
            throw new Error("Zone not found");
        }
        if (zone.name !== name) {
            const regExp = new RegExp(`^${name}$`);
            const existZone = yield zones_1.default.findOne({
                name: { $regex: regExp, $options: "" }, isDeleted: false
            });
            if (existZone) {
                res.status(400);
                throw new Error("This zone already exists");
            }
        }
    }
    const updatedZone = yield zones_1.default.findOneAndUpdate({ _id: zoneId, isDeleted: false }, req.body, { new: true });
    if (!updatedZone) {
        res.status(400);
        throw new Error("Zone not updated");
    }
    res.status(200).json({
        success: true,
        msg: "Zone details successfully updated",
    });
}));
// DELETE ||  delete zone details
exports.deleteZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { zoneId } = req.query;
    if (!zoneId) {
        res.status(400);
        throw new Error("zoneId not found");
    }
    const zone = yield zones_1.default.findByIdAndUpdate({ _id: zoneId }, {
        isDeleted: true,
    }, { new: true });
    if (!zone) {
        res.status(400);
        throw new Error("Deletion failed");
    }
    res.status(200).json({
        success: true,
        msg: `${zone === null || zone === void 0 ? void 0 : zone.name} successfully deleted`,
    });
}));
// GET || get Zone details
exports.getZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zones = yield zones_1.default.find({ isDeleted: false });
    res.status(200).json({
        success: true,
        zones: zones || [],
        msg: "Zone details successfully retrieved",
    });
}));
