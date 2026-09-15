import { Router } from "express";

import * as leadController
  from "../controllers/lead.controller.js";

import * as emailController
  from "../controllers/email.controller.js";

import {
  authMiddleware
} from "../middleware/auth.middleware.js";

import {
  requirePermission
} from "../middleware/permission.middleware.js";

import {
  validate
} from "../middleware/validation.middleware.js";

import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema
} from "../validations/lead.validation.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  requirePermission("LEAD_CREATE"),
  validate(createLeadSchema),
  leadController.createLead
);

router.get(
  "/",
  requirePermission("LEAD_READ"),
  leadController.getLeads
);

router.get(
  "/:leadId/emails",
  requirePermission("EMAIL_CREATE"),
  emailController.getLeadEmailsController
);

router.get(
  "/:id",
  requirePermission("LEAD_READ"),
  leadController.getLead
);

router.patch(
  "/:id",
  requirePermission("LEAD_UPDATE"),
  validate(updateLeadSchema),
  leadController.updateLead
);

router.patch(
  "/:id/status",
  requirePermission("LEAD_UPDATE"),
  validate(updateLeadStatusSchema),
  leadController.updateLeadStatus
);

export default router;