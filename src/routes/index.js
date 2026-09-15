import { Router } from "express";

import authRoutes from "./auth.routes.js";
import employeeRoutes from "./employee.routes.js";
import leadRoutes from "./lead.routes.js";
import emailRoutes from "./email.routes.js";
import publicRoutes from "./public.routes.js";
import auditRoutes from "./audit.routes.js";
import permissionRoutes from "./permission.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/leads", leadRoutes);
router.use("/emails", emailRoutes);
router.use("/public", publicRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/permissions", permissionRoutes);

export default router;