import { Router } from "express";
import {
  getDomainActivities,
  getGlobalDomainActivities,
  getSimilarDomains,
} from "../controllers/domains.controller.js";

const router = Router();

router.get("/domains/similar", getSimilarDomains);
router.get("/domains/activities/global", getGlobalDomainActivities);
router.get("/domains/:domainId/activities", getDomainActivities);

export default router;