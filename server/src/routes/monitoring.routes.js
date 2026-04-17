import { Router } from "express";
import {
  getSecurityThreatLogs,
  getSystemSecurityStatus,
} from "../controllers/monitoring.controller.js";

const router = Router();

router.get("/monitoring/security-status", getSystemSecurityStatus);
router.get("/monitoring/security-logs", getSecurityThreatLogs);

export default router;