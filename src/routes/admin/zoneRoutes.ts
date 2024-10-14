import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares";
import {
  deleteZoneDetails,
  getZoneDetails,
  updateZoneDetails,
  uploadZoneDetails,
} from "../../controllers/admin/zoneController";

// Zone routes
router
  .route("/zone")
  .post(adminProtect, uploadZoneDetails)
  .patch(adminProtect, updateZoneDetails)
  .get(adminProtect, getZoneDetails)
  .delete(adminProtect, deleteZoneDetails);

export default router;
