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
exports.getSingleParticipantDetails = exports.getParticipantDetails = exports.deleteParticipantDetails = exports.updateParticipantDetails = exports.uploadParticipantDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const participant_1 = __importDefault(require("../../models/participant"));
const result_1 = __importDefault(require("../../models/result"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.uploadParticipantDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, phone, address, gender, zone, age } = req.body;
    const { image } = req.files || {};
    const imageUrl = image && ((_a = image[0]) === null || _a === void 0 ? void 0 : _a.location);
    if (!name || !email || !phone || !address || !gender || !zone || !age) {
        res.status(400);
        throw new Error('Please enter all the fields');
    }
    const existParticipant = yield participant_1.default.findOne({
        email,
        isDeleted: false,
    });
    if (existParticipant) {
        res.status(400);
        throw new Error(`${email} Participant already exists`);
    }
    const participant = yield participant_1.default.create(Object.assign(Object.assign({}, req.body), { image: imageUrl && imageUrl }));
    if (!participant) {
        res.status(400);
        throw new Error('Participant upload failed');
    }
    res.status(201).json({
        success: true,
        msg: 'Participant details successfully uploaded',
    });
}));
// PATCH || update Participant details
exports.updateParticipantDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { participantId, email } = req.body;
    const { image } = req.files || {};
    const imageUrl = image && ((_b = image[0]) === null || _b === void 0 ? void 0 : _b.location);
    if (!participantId) {
        res.status(400);
        throw new Error('Participant Id  not found');
    }
    if (email) {
        const participant = yield participant_1.default.findOne({
            _id: participantId,
            isDeleted: false,
        });
        if (!participant) {
            res.status(404);
            throw new Error('Participant not found');
        }
        if (participant.email !== email) {
            const existParticipant = yield participant_1.default.findOne({
                email,
                isDeleted: false,
            });
            if (existParticipant) {
                res.status(400);
                throw new Error('This email already used');
            }
        }
    }
    const updatedParticipant = yield participant_1.default.findOneAndUpdate({ _id: participantId, isDeleted: false }, Object.assign(Object.assign({}, req.body), { image: imageUrl && imageUrl }), { new: true });
    if (!updatedParticipant) {
        res.status(400);
        throw new Error('Participant not updated');
    }
    res.status(200).json({
        success: true,
        msg: 'Participant details successfully updated',
    });
}));
// DELETE ||  delete Participant details
exports.deleteParticipantDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participantId } = req.query;
    if (!participantId) {
        res.status(400);
        throw new Error('participantId not found');
    }
    const existParticipant = yield participant_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(String(participantId)),
        isDeleted: false,
    });
    const isInLiveCompetition = yield result_1.default.findOne({
        zone: new mongoose_1.default.Types.ObjectId(String(existParticipant === null || existParticipant === void 0 ? void 0 : existParticipant.zone)),
        isCompleted: false,
        isDeleted: false,
    });
    if (isInLiveCompetition) {
        res.status(400);
        throw new Error('The Participant is already in a live competition');
    }
    const participant = yield participant_1.default.findByIdAndUpdate({ _id: participantId }, {
        isDeleted: true,
    }, { new: true });
    if (!participant) {
        res.status(400);
        throw new Error('Deletion failed');
    }
    res.status(200).json({
        success: true,
        msg: `${participant === null || participant === void 0 ? void 0 : participant.name} successfully deleted`,
    });
}));
// GET || get Participant details
exports.getParticipantDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const searchData = req.query.search || '';
    const zones = req.query.zones || '';
    const query = { isDeleted: false };
    if (searchData !== '') {
        query.name = { $regex: new RegExp(`^${searchData}.*`, 'i') };
    }
    if (zones !== '') {
        query.zone = { $in: zones };
    }
    const participant = yield participant_1.default.find(query)
        .populate('zone')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalDocuments = yield participant_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        participant: participant || [],
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        msg: 'Participant details successfully retrieved',
    });
}));
// GET || get single Participant details
exports.getSingleParticipantDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participantId } = req.params;
    if (!participantId) {
        res.status(400);
        throw new Error('participantId is required');
    }
    const participant = yield participant_1.default.findOne({
        _id: participantId,
        isDeleted: false,
    }).populate('zone');
    if (!participant) {
        res.status(400);
        throw new Error('Participant not found');
    }
    const competitions = yield result_1.default.find({
        participant: participantId,
        isDeleted: false,
    })
        .populate('zone')
        .populate('participant')
        .populate({
        path: 'results',
        populate: [
            {
                path: 'question',
                model: 'Question',
            },
            {
                path: 'responses.judge',
                model: 'Judge',
            },
        ],
    });
    res.status(200).json({
        success: true,
        participant: participant,
        competitions: competitions || [],
        msg: 'Participant details successfully retrieved',
    });
}));
