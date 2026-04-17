import { Router } from "express";
import { requireClerkAuth } from "../shared/auth/clerkAuth.js";
import authRoutes from "./auth.routes.js";
import alertsRoutes from "./alerts.routes.js";
import domainIntelligenceRoutes from "../features/domain-intelligence/routes/domainIntelligence.routes.js";
import emailRoutes from "../features/email-intelligence/routes/emailRoutes.js";
import domainsRoutes from "./domains.routes.js";
import monitoringRoutes from "./monitoring.routes.js";
import organizationsRoutes from "./organizations.routes.js";
import systemRoutes from "./system.routes.js";
import threatsRoutes from "./threats.routes.js";

const router = Router();

router.use(authRoutes);
router.use(emailRoutes);

router.use(requireClerkAuth);
router.use(threatsRoutes);
router.use(alertsRoutes);
router.use(domainIntelligenceRoutes);
router.use(organizationsRoutes);
router.use(domainsRoutes);
router.use(monitoringRoutes);
router.use(systemRoutes);

export default router;