"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const bundleController_1 = require("../../controllers/admin/bundleController");
// Bundle routes
router
    .route("/")
    .post(authMiddlewares_1.adminProtect, bundleController_1.uploadBundleDetails)
    .patch(authMiddlewares_1.adminProtect, bundleController_1.updateBundleDetails)
    .get(authMiddlewares_1.adminProtect, bundleController_1.getBundleDetails)
    .delete(authMiddlewares_1.adminProtect, bundleController_1.deleteBundleDetails);
router.get("/:bundleId", authMiddlewares_1.adminProtect, bundleController_1.getSingleBundleDetails);
exports.default = router;
