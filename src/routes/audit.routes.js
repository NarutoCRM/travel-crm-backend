import { Router } from "express";

import {
  listAuditLogs
} from "../controllers/audit.controller.js";

import {
  authMiddleware
} from "../middleware/auth.middleware.js";

import {
  requirePermission
} from "../middleware/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requirePermission("ACCEPTANCE_READ"),
  listAuditLogs
);

export default router;