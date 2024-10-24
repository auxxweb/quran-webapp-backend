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
exports.createBundleId = exports.createQuestionId = void 0;
const bundle_1 = __importDefault(require("../models/bundle"));
const question_1 = __importDefault(require("../models/question"));
const createQuestionId = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionCount = yield question_1.default.countDocuments();
    const paddedCount = String(questionCount + 1).padStart(4, '0'); // Pads the number to 4 digits
    return `QS${paddedCount}`;
});
exports.createQuestionId = createQuestionId;
const createBundleId = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionCount = yield bundle_1.default.countDocuments();
    const paddedCount = String(questionCount + 1).padStart(4, '0'); // Pads the number to 4 digits
    return `QB${paddedCount}`;
});
exports.createBundleId = createBundleId;
