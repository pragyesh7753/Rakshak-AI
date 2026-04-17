import { Router } from "express";
import { requireClerkAuth } from "../../../shared/auth/clerkAuth.js";
import {
	emailWebhookController,
	getEmailIntelligenceResultsController,
} from "../controllers/emailWebhookController.js";

const router = Router();

router.post("/email/webhook", emailWebhookController);
router.get("/email/intelligence", requireClerkAuth, getEmailIntelligenceResultsController);

export default router;
