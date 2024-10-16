import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares";
import { deleteBundleDetails, getBundleDetails, updateBundleDetails, uploadBundleDetails } from "../../controllers/admin/bundleController";

// Bundle routes

router
  .route("/")
  .post(adminProtect, uploadBundleDetails)
  .patch(adminProtect, updateBundleDetails)
  .get(adminProtect, getBundleDetails)
  .delete(adminProtect, deleteBundleDetails);

export default router;
