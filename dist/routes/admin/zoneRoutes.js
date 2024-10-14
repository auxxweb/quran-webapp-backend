"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const zoneController_1 = require("../../controllers/admin/zoneController");
// Zone routes
router
    .route("/zone")
    .post(authMiddlewares_1.adminProtect, zoneController_1.uploadZoneDetails)
    .patch(authMiddlewares_1.adminProtect, zoneController_1.updateZoneDetails)
    .get(authMiddlewares_1.adminProtect, zoneController_1.getZoneDetails)
    .delete(authMiddlewares_1.adminProtect, zoneController_1.deleteZoneDetails);
exports.default = router;
