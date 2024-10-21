"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const adminController_1 = require("../../controllers/admin/adminController");
const router = express_1.default.Router();
router.route("/updatePassword").patch(authMiddlewares_1.adminProtect, adminController_1.updatePassword);
router.route("/getDashboardDetails").get(authMiddlewares_1.adminProtect, adminController_1.getDashboardDetails);
exports.default = router;
