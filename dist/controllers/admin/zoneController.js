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
exports.getAllZonesNames = exports.getZoneDetails = exports.deleteZoneDetails = exports.updateZoneDetails = exports.uploadZoneDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const uniqid_1 = __importDefault(require("uniqid"));
const store_1 = __importDefault(require("store"));
const zones_1 = __importDefault(require("../../models/zones"));
const mongoose_1 = __importDefault(require("mongoose"));
const result_1 = __importDefault(require("../../models/result"));
const judge_1 = __importDefault(require("../../models/judge"));
const participant_1 = __importDefault(require("../../models/participant"));
exports.uploadZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    if (!name || !description) {
        res.status(400);
        throw new Error('Please enter all the fields');
    }
    const regExp = new RegExp(`^${name.trim()}$`);
    const existZone = yield zones_1.default.findOne({
        name: { $regex: regExp, $options: 'i' },
        isDeleted: false,
    });
    if (existZone) {
        res.status(400);
        throw new Error(`${name} zone already exists`);
    }
    let tx_uuid = (0, uniqid_1.default)();
    store_1.default.set('uuid', { tx: tx_uuid });
    const zone = yield zones_1.default.create(Object.assign(Object.assign({}, req.body), { url: `${tx_uuid}` }));
    if (!zone) {
        res.status(400);
        throw new Error('Zone upload failed');
    }
    res.status(201).json({
        success: true,
        msg: 'Zone details successfully uploaded',
    });
}));
// PATCH || update Zone details
exports.updateZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { zoneId, name } = req.body;
    if (!zoneId) {
        res.status(400);
        throw new Error('Zone Id  not found');
    }
    if (name) {
        const zone = yield zones_1.default.findOne({
            _id: zoneId,
            isDeleted: false,
        });
        if (!zone) {
            res.status(404);
            throw new Error('Zone not found');
        }
        if (zone.name !== name) {
            const regExp = new RegExp(`^${name}$`);
            const existZone = yield zones_1.default.findOne({
                name: { $regex: regExp, $options: '' },
                isDeleted: false,
            });
            if (existZone) {
                res.status(400);
                throw new Error('This zone already exists');
            }
        }
    }
    const updatedZone = yield zones_1.default.findOneAndUpdate({ _id: zoneId, isDeleted: false }, Object.assign({}, req.body), { new: true });
    if (!updatedZone) {
        res.status(400);
        throw new Error('Zone not updated');
    }
    res.status(200).json({
        success: true,
        msg: 'Zone details successfully updated',
    });
}));
// DELETE ||  delete zone details
exports.deleteZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { zoneId } = req.query;
    if (!zoneId) {
        res.status(400);
        throw new Error('zoneId not found');
    }
    const isInLiveCompetition = yield result_1.default.findOne({
        zone: new mongoose_1.default.Types.ObjectId(String(zoneId)),
        isCompleted: false,
        isDeleted: false,
    });
    if (isInLiveCompetition) {
        res.status(400);
        throw new Error("Live competition in this zone; can't delete.");
    }
    try {
        // Update the zone to mark it as deleted
        const updatedZone = yield zones_1.default.findByIdAndUpdate(zoneId, { isDeleted: true }, { new: true });
        // Update judges and participants in parallel
        yield Promise.all([
            judge_1.default.updateMany({ zone: new mongoose_1.default.Types.ObjectId(String(zoneId)) }, { isDeleted: true }),
            participant_1.default.updateMany({ zone: new mongoose_1.default.Types.ObjectId(String(zoneId)) }, { isDeleted: true }),
        ]);
        res.status(200).json({
            success: true,
            msg: `${updatedZone === null || updatedZone === void 0 ? void 0 : updatedZone.name} zone successfully deleted`,
        });
    }
    catch (error) {
        // Rollback changes if an error occurs
        yield Promise.all([
            zones_1.default.findByIdAndUpdate(zoneId, { isDeleted: false }),
            judge_1.default.updateMany({ zone: new mongoose_1.default.Types.ObjectId(String(zoneId)) }, { isDeleted: true }),
            participant_1.default.updateMany({ zone: new mongoose_1.default.Types.ObjectId(String(zoneId)) }, { isDeleted: true }),
        ]);
        res.status(400).json({ message: 'Deletion failed' });
    }
    // if (!zone) {
    //   res.status(400)
    //   throw new Error('Deletion failed')
    // }
}));
// GET || get Zone details
exports.getZoneDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const searchData = req.query.search || '';
    const query = { isDeleted: false };
    if (searchData !== '') {
        query.name = { $regex: new RegExp(`^${searchData}.*`, 'i') };
    }
    const zones = yield zones_1.default.aggregate([
        // Match the initial query
        { $match: query },
        // Lookup judges to check for main judges
        {
            $lookup: {
                from: 'judges', // Make sure this matches your Judge collection name
                localField: '_id',
                foreignField: 'zone',
                as: 'judges'
            }
        },
        // Add a field to check for main judges
        {
            $addFields: {
                mainJudge: {
                    $gt: [{ $size: { $filter: { input: '$judges', cond: { $eq: ['$$this.isMain', true] } } } }, 0]
                }
            }
        },
        // Sort the results
        { $sort: { [sortBy]: sortOrder } },
        // Paginate the results
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);
    const totalDocuments = yield zones_1.default.countDocuments(query);
    console.log(zones, "zones");
    res.status(200).json({
        success: true,
        zones: zones || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: 'Zone details successfully retrieved',
    });
}));
// GET || get Zones names and ids
exports.getAllZonesNames = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const zones = yield zones_1.default.find({ isDeleted: false }, { name: 1 });
    res.status(200).json({
        success: true,
        zones: zones || [],
        msg: 'Zone details successfully retrieved',
    });
}));
