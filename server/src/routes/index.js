import { Router } from "express";
import { requireClerkAuth } from "../middleware/auth.js";
import alertsRoutes from "./alerts.routes.js";
import domainsRoutes from "./domains.routes.js";
import monitoringRoutes from "./monitoring.routes.js";
import organizationsRoutes from "./organizations.routes.js";
import systemRoutes from "./system.routes.js";
import threatsRoutes from "./threats.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "rakshak-backend" });
});

router.use(requireClerkAuth);
router.use(threatsRoutes);
router.use(alertsRoutes);
router.use(organizationsRoutes);
router.use(domainsRoutes);
router.use(monitoringRoutes);
router.use(systemRoutes);

export default router;