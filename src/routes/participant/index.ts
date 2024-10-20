import express from "express";
const router = express.Router();

import participantRoute from './participantRoute'

router.use("/", participantRoute);

export default router