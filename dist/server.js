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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
require("./config/connectDB");
const authRoutes_1 = __importDefault(require("./routes/admin/authRoutes"));
const zoneRoutes_1 = __importDefault(require("./routes/admin/zoneRoutes"));
const judgeRoutes_1 = __importDefault(require("./routes/admin/judgeRoutes"));
const errorMiddlewares_1 = require("./middlewares/errorMiddlewares");
const admin_1 = __importDefault(require("./models/admin"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => res.json({ success: true, msg: "Quran_Quiz app server working successfully!" }));
// Admin Routes
app.use('/api/admin/auth', authRoutes_1.default);
app.use('/api/admin/zone', zoneRoutes_1.default);
app.use('/api/admin/judge', judgeRoutes_1.default);
const addAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = "admin@quranapp.com";
    const password = "admin@123";
    const salt = yield bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password.trim(), salt);
    yield admin_1.default.create({
        email,
        password: hashedPassword,
        name: "Admin"
    });
});
// addAdmin()
app.use(errorMiddlewares_1.notFound);
app.use(errorMiddlewares_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
