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
exports.sendEmail = exports.createVerificationCode = exports.judgeGenerateToken = exports.generateToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateToken = (id, expiresTime) => {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: expiresTime });
};
exports.generateToken = generateToken;
const judgeGenerateToken = (id, expiresTime) => {
    const secret = process.env.JWT_SECRET_JUDGE;
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: expiresTime });
};
exports.judgeGenerateToken = judgeGenerateToken;
const createVerificationCode = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().padStart(6, '0');
};
exports.createVerificationCode = createVerificationCode;
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html = '', attachments = [] }) {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.User,
            pass: process.env.AppPassword,
        },
    });
    transporter.verify();
    const mailOptions = {
        from: process.env.User,
        to,
        subject,
        html,
        attachments
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
exports.sendEmail = sendEmail;
