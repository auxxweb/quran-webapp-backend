import express from "express";
const router = express.Router();
import { adminProtect } from "../../middlewares/authMiddlewares"
import { deleteParticipantDetails, getParticipantDetails, getSingleParticipantDetails, updateParticipantDetails, uploadParticipantDetails } from "../../controllers/admin/participantController";

router
  .route("/")
  .post(adminProtect, uploadParticipantDetails)
  .patch(adminProtect, updateParticipantDetails)
  .get(adminProtect, getParticipantDetails)
  .delete(adminProtect, deleteParticipantDetails);

  router.get("/:participantId",adminProtect,getSingleParticipantDetails)


  export default router
