import { Router } from "express";
import {
  getProcessingLogSummary,
  getProcessingLogs,
  startPipeline,
} from "../controllers/system.controller.js";

const router = Router();

router.get("/system/logs", getProcessingLogs);
router.get("/system/logs/summary", getProcessingLogSummary);
router.post("/system/pipeline/start", startPipeline);

export default router;