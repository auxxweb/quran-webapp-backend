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
exports.instaDetails = exports.postDetails = exports.googleSignup = exports.googleLogin = exports.otpVerification = exports.signupUser = exports.loginUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const constants_1 = require("../../config/constants");
const mailTemplate_1 = require("../../config/mailTemplate");
const influencerModel_1 = __importDefault(require("../../models/influencerModel"));
const cheerio_1 = __importDefault(require("cheerio"));
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const client = yield influencerModel_1.default.findOne({
        email,
        role: "Influencer",
        isDeleted: false,
    });
    if (!client) {
        res.status(400);
        throw new Error("User does't exist..Please create a new account");
    }
    // const isMatch = await bcrypt.compare(password, client.password);
    // if (!isMatch) {
    //   res.status(400);
    //   throw new Error("Incorrect Password!");
    // }
    const otp = (0, constants_1.createVerificationCode)();
    const html = (0, mailTemplate_1.sendOtp)({ name: client === null || client === void 0 ? void 0 : client.name, otp });
    yield (0, constants_1.sendEmail)({
        to: email,
        subject: "GEEKSTACK - OTP VERIFICATION",
        html: html,
    });
    res.status(200).json({
        success: true,
        msg: "Please Verify Your OTP",
        otp,
    });
}));
exports.signupUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email } = req.body;
    if (!email || !name || !phone) {
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const conflictingUser = yield influencerModel_1.default.findOne({
        $or: [
            { email, role: "Influencer", isDeleted: false },
            { phone, role: "Influencer", isDeleted: false },
        ],
    });
    if (conflictingUser) {
        if (conflictingUser.email === email) {
            res.status(400);
            throw new Error("Email already exists");
        }
        if (conflictingUser.phone === phone) {
            res.status(400);
            throw new Error("Phone number already exists");
        }
    }
    const otp = (0, constants_1.createVerificationCode)();
    const html = (0, mailTemplate_1.sendOtp)({ name: name, otp });
    yield (0, constants_1.sendEmail)({
        to: email,
        subject: "GEEKSTACK - OTP VERIFICATION",
        html: html,
    });
    res.status(200).json({
        success: true,
        msg: "Please Verify Your OTP",
        otp,
    });
}));
exports.otpVerification = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, login } = req.body;
    const client = yield influencerModel_1.default.findOne({
        email,
        role: "Influencer",
        isDeleted: false,
    });
    if (client && !login) {
        res.status(400);
        throw new Error("User Already exist");
    }
    let user;
    if (login) {
        user = yield influencerModel_1.default.findOne({
            email,
            role: "Influencer",
            isDeleted: false,
        });
    }
    else {
        user = yield influencerModel_1.default.create(Object.assign(Object.assign({}, req.body), { role: "Influencer" }));
    }
    let clientInfo = {
        email: user === null || user === void 0 ? void 0 : user.email,
        id: user === null || user === void 0 ? void 0 : user._id,
        role: user === null || user === void 0 ? void 0 : user.role,
        name: user === null || user === void 0 ? void 0 : user.name,
        number: (user === null || user === void 0 ? void 0 : user.phone) ? true : false,
        token: (0, constants_1.generateToken)(user === null || user === void 0 ? void 0 : user._id, "5d"),
    };
    res.status(200).json({
        success: true,
        user: clientInfo,
        msg: login ? "Login successfully" : "SignUp successfully",
    });
}));
exports.googleLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email not found");
    }
    const user = yield influencerModel_1.default.findOne({
        email,
        role: "Influencer",
        isDeleted: false,
    });
    if (!user) {
        res.status(400);
        throw new Error("User does't exist");
    }
    let clientInfo = {
        email: user === null || user === void 0 ? void 0 : user.email,
        id: user === null || user === void 0 ? void 0 : user._id,
        role: user === null || user === void 0 ? void 0 : user.role,
        name: user === null || user === void 0 ? void 0 : user.name,
        number: (user === null || user === void 0 ? void 0 : user.phone) ? true : false,
        token: (0, constants_1.generateToken)(user === null || user === void 0 ? void 0 : user._id, "5d"),
    };
    res.status(200).json({
        success: true,
        user: clientInfo,
        msg: "Login successfully",
    });
}));
exports.googleSignup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    if (!email || !name) {
        res.status(400);
        throw new Error("Email and Name not found");
    }
    const existUser = yield influencerModel_1.default.findOne({
        email,
        role: "Influencer",
        isDeleted: false,
    });
    if (existUser) {
        res.status(400);
        throw new Error("User Already exist");
    }
    const user = yield influencerModel_1.default.create(Object.assign(Object.assign({}, req.body), { role: "Influencer" }));
    let clientInfo = {
        email: user === null || user === void 0 ? void 0 : user.email,
        id: user === null || user === void 0 ? void 0 : user._id,
        role: user === null || user === void 0 ? void 0 : user.role,
        name: user === null || user === void 0 ? void 0 : user.name,
        number: (user === null || user === void 0 ? void 0 : user.phone) ? true : false,
        token: (0, constants_1.generateToken)(user === null || user === void 0 ? void 0 : user._id, "5d"),
    };
    res.status(200).json({
        success: true,
        user: clientInfo,
        msg: "SignUp successfully",
    });
}));
exports.postDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, phone, } = req.body;
    if (!id || !phone) {
        res.status(400);
        throw new Error("id and Phone not found");
    }
    const existUser = yield influencerModel_1.default.findOne({
        phone,
        role: "Influencer",
        isDeleted: false,
    });
    if (existUser) {
        res.status(400);
        throw new Error("Phone number already used");
    }
    yield influencerModel_1.default.findByIdAndUpdate(id, req.body);
    res.status(200).json({
        success: true,
        msg: "Details Updated Successfully",
    });
}));
exports.instaDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    console.log(req.body, "req.body");
    const response = yield fetch(url);
    console.log(response, "response");
    const html = yield response.text();
    const $ = cheerio_1.default.load(html);
    // Extract the profile image and followers count from meta tags
    const profileImage = $('meta[property="og:image"]').attr("content");
    const followersCount = $('meta[name="description"]').attr("content");
    console.log(profileImage, "profileImage");
    console.log(followersCount, "followersCount");
    // Parse followers count (this will give the description which usually contains the followers count)
    const followersText = followersCount
        ? followersCount.split(" - ")[0].split(" ")[0]
        : "0";
    res.status(200).json({
        profileImage,
        followersCount: followersText,
    });
}));
