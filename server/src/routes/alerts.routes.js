import { Router } from "express";
import { getAlerts, markAlertAsRead } from "../controllers/alerts.controller.js";

const router = Router();

router.get("/alerts", getAlerts);
router.patch("/alerts/:alertId/read", markAlertAsRead);

export default router;