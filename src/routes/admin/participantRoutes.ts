import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares"
import { deleteParticipantDetails, getParticipantDetails, getSingleParticipantDetails, updateParticipantDetails, uploadParticipantDetails } from "../../controllers/admin/participantController";
import upload from "../../middlewares/multer";

router
  .route("/")
  .post(adminProtect,upload.fields([{ name: "image", maxCount: 1 }]), uploadParticipantDetails)
  .patch(adminProtect,upload.fields([{ name: "image", maxCount: 1 }]), updateParticipantDetails)
  .get(adminProtect, getParticipantDetails)
  .delete(adminProtect, deleteParticipantDetails);

  router.get("/:participantId",adminProtect,getSingleParticipantDetails)


  export default router
