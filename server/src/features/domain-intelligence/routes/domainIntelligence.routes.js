import { Router } from "express";
import {
  getDomainIntelligenceAlerts,
  triggerDomainIntelligence,
} from "../controllers/domainIntelligence.controller.js";

const router = Router();

router.get("/domain-intelligence/alerts", getDomainIntelligenceAlerts);
router.get("/alerts/domain-intelligence", getDomainIntelligenceAlerts);
router.post("/domain-intelligence/run", triggerDomainIntelligence);

export default router;
