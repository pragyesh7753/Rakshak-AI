import { Router } from "express";
import {
  getMyOrganization,
  getOrganizationByUserId,
  upsertMyOrganization,
} from "../controllers/organizations.controller.js";

const router = Router();

router.get("/organizations/me", getMyOrganization);
router.post("/organizations/me", upsertMyOrganization);
router.get("/organizations/:userId", getOrganizationByUserId);

export default router;