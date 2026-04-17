import { Router } from "express";
import { requireClerkAuth } from "../shared/auth/clerkAuth.js";

const router = Router();

router.get("/auth/verify", requireClerkAuth, (req, res) => {
  res.json({ 
    authenticated: true, 
    userId: req.userId 
  });
});

export default router;
