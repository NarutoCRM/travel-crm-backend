import { Router } from "express";

import {
  listRoles,
  getRole,
  createNewRole,
  editRole,
  removeRole
} from "../controllers/role.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requirePermission("ROLE_READ"),
  listRoles
);

router.get(
  "/:id",
  requirePermission("ROLE_READ"),
  getRole
);

router.post(
  "/",
  requirePermission("ROLE_CREATE"),
  createNewRole
);

router.patch(
  "/:id",
  requirePermission("ROLE_UPDATE"),
  editRole
);

router.delete(
  "/:id",
  requirePermission("ROLE_DELETE"),
  removeRole
);

export default router;