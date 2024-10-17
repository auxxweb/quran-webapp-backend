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
import upload from "../../middlewares/multer";

// Zone routes
router
  .route("/")
  .post(adminProtect,upload.fields([{ name: "image", maxCount: 1 }]), uploadZoneDetails)
  .patch(adminProtect,upload.fields([{ name: "image", maxCount: 1 }]), updateZoneDetails)
  .get(adminProtect, getZoneDetails)
  .delete(adminProtect, deleteZoneDetails);

  router.get("/all", adminProtect,getAllZonesNames)

export default router;
