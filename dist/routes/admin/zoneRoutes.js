"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const zoneController_1 = require("../../controllers/admin/zoneController");
const multer_1 = __importDefault(require("../../middlewares/multer"));
// Zone routes
router
    .route("/")
    .post(authMiddlewares_1.adminProtect, multer_1.default.fields([{ name: "image", maxCount: 1 }]), zoneController_1.uploadZoneDetails)
    .patch(authMiddlewares_1.adminProtect, multer_1.default.fields([{ name: "image", maxCount: 1 }]), zoneController_1.updateZoneDetails)
    .get(authMiddlewares_1.adminProtect, zoneController_1.getZoneDetails)
    .delete(authMiddlewares_1.adminProtect, zoneController_1.deleteZoneDetails);
router.get("/all", authMiddlewares_1.adminProtect, zoneController_1.getAllZonesNames);
exports.default = router;
