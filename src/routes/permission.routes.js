import { Router } from "express";

import {
  listPermissions,
  getPermission
} from "../controllers/permission.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requirePermission("ROLE_READ"),
  listPermissions
);

router.get(
  "/:id",
  requirePermission("ROLE_READ"),
  getPermission
);

export default router;