import { Router } from "express";

import {
  createAndSendEmail,
  listEmails,
  getEmail,
  acceptEmailController,
} from "../controllers/email.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = Router();

// ========================================
// PUBLIC ROUTE
// Customer acceptance link
// NO LOGIN / NO AUTH HEADER
// ========================================

router.post(
  "/acceptance/:token",
  acceptEmailController
);

// ========================================
// PROTECTED ROUTES
// ========================================

// View email list
router.get(
  "/",
  authMiddleware,
  requirePermission("EMAIL_READ"),
  listEmails
);

// View single email
router.get(
  "/:id",
  authMiddleware,
  requirePermission("EMAIL_READ"),
  getEmail
);

// Send email
router.post(
  "/send",
  authMiddleware,
  requirePermission("EMAIL_SEND"),
  createAndSendEmail
);

export default router;