import { Router } from "express";
import { getRecentThreats, getSummaryStats, getThreatDetails } from "../controllers/threats.controller.js";

const router = Router();

router.get("/threats/summary", getSummaryStats);
router.get("/threats", getRecentThreats);
router.get("/threats/:threatId", getThreatDetails);

export default router;