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
exports.getUser = void 0;
const participant_1 = __importDefault(require("../../models/participant"));
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const participant = yield participant_1.default.findOne({ _id: req.params.id, });
        if (!participant) {
            return res.status(404).json({
                message: "participant not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "participant fetched successfully",
            participant: participant,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
