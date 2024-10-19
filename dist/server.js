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
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
require("./config/connectDB");
const adminRoutes_1 = __importDefault(require("./routes/admin/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/admin/authRoutes"));
const zoneRoutes_1 = __importDefault(require("./routes/admin/zoneRoutes"));
const judgeRoutes_1 = __importDefault(require("./routes/admin/judgeRoutes"));
const participantRoutes_1 = __importDefault(require("./routes/admin/participantRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/admin/questionRoutes"));
const bundleRoutes_1 = __importDefault(require("./routes/admin/bundleRoutes"));
const resultRoutes_1 = __importDefault(require("./routes/admin/resultRoutes"));
const index_1 = __importDefault(require("./routes/judge/index"));
const errorMiddlewares_1 = require("./middlewares/errorMiddlewares");
const admin_1 = __importDefault(require("./models/admin"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: ['http://localhost:3000', 'https://gedexoquizadmin.auxxweb.in', "https://gedexoquiz.auxxweb.in"],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => res.json({ success: true, msg: "Quran_Quiz app server working successfully!" }));
app.use("/api/judge", index_1.default);
// Admin Routes
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/admin/auth', authRoutes_1.default);
app.use('/api/admin/zone', zoneRoutes_1.default);
app.use('/api/admin/judge', judgeRoutes_1.default);
app.use('/api/admin/participant', participantRoutes_1.default);
app.use('/api/admin/question', questionRoutes_1.default);
app.use('/api/admin/bundle', bundleRoutes_1.default);
app.use('/api/admin/result', resultRoutes_1.default);
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
// app.listen(PORT, () => console.log(`listening on ${PORT}`));
const server = app.listen(PORT, () => console.log(`listening on ${PORT}`));
exports.io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        methods: ['GET', 'POST', "PATCH", "DELETE"],
        credentials: false,
    },
});
exports.io.on("connection", (socket) => {
    socket.on('join', (zoneId) => {
        console.log(`Zone ${socket.id} joined room ${zoneId}`);
        socket.join(zoneId);
        socket.emit("connected");
    });
    socket.on('selected-participant', ({ success, userId, zoneId }) => {
        console.log(`Broadcasting selected participant to zone: ${zoneId}`);
        // Send the event to all users in the room/zone
        exports.io.to(zoneId).emit('selected-participant', { success, userId });
    });
    socket.on('proceed-question', ({ success, resultId, zoneId }) => {
        console.log(`Broadcasting proceed to question to zone: ${zoneId}`);
        // Send the event to all users in the room/zone
        exports.io.to(zoneId).emit('proceed-question', { success, resultId });
    });
    socket.on('disconnect', () => {
        console.log(`Zone ${socket.id} disconnected`);
    });
});
