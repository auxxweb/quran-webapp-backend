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
exports.login = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const judge_1 = __importDefault(require("../../models/judge"));
const loginDto_1 = require("../../dto/loginDto");
const handleValidationErrors_1 = require("../../utils/handleValidationErrors");
const constants_1 = require("../../config/constants");
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const login_dto = (0, class_transformer_1.plainToClass)(loginDto_1.LoginDto, (_a = req.body) !== null && _a !== void 0 ? _a : {});
        const error_messages = yield (0, class_validator_1.validate)(login_dto);
        if (error_messages && error_messages.length > 0) {
            const error = yield (0, handleValidationErrors_1.handleValidationErrors)(res, error_messages);
            return res.status(401).json({ error });
        }
        const { email, password } = req.body;
        const judge = yield judge_1.default.findOne({ email: email }).populate('zone');
        if (!judge) {
            return res.status(401).json({
                errors: { email: "Account not found, invalid email" },
                success: false,
            });
        }
        if (judge.password !== password) {
            return res
                .status(401)
                .json({ success: false, errors: { password: "Password does not match" } });
        }
        if (judge.isBlocked) {
            return res
                .status(401)
                .json({ success: false, errors: { common: "Access denied. Please contact the admin." } });
        }
        let judgeInfo = {
            email: judge === null || judge === void 0 ? void 0 : judge.email,
            name: judge === null || judge === void 0 ? void 0 : judge.name,
            zone: judge === null || judge === void 0 ? void 0 : judge.zone.name,
            isMain: judge === null || judge === void 0 ? void 0 : judge.isMain,
            id: judge === null || judge === void 0 ? void 0 : judge._id,
            token: (0, constants_1.judgeGenerateToken)(judge === null || judge === void 0 ? void 0 : judge._id, "7d"),
        };
        res.status(200).json({
            success: true,
            data: judgeInfo,
            message: "Login successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
