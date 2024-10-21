import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares";
import {
  deleteZoneDetails,
  getZoneDetails,
  updateZoneDetails,
  uploadZoneDetails,
  getAllZonesNames,
} from "../../controllers/admin/zoneController";

// Zone routes
router
  .route("/")
  .post(adminProtect, uploadZoneDetails)
  .patch(adminProtect, updateZoneDetails)
  .get(adminProtect, getZoneDetails)
  .delete(adminProtect, deleteZoneDetails);

router.get("/all", adminProtect, getAllZonesNames);

export default router;
