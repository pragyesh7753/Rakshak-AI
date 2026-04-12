import { Router } from "express";
import { getProcessingLogs } from "../controllers/system.controller.js";

const router = Router();

router.get("/system/logs", getProcessingLogs);

export default router;