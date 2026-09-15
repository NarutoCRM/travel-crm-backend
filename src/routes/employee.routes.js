import { Router } from "express";

import * as employeeController
  from "../controllers/employee.controller.js";

import authMiddleware
  from "../middleware/auth.middleware.js";

import { requirePermission }
  from "../middleware/permission.middleware.js";

import {
  createEmployeeSchema,
  changePasswordSchema
} from "../validations/employee.validation.js";

import {
  validate
} from "../middleware/validation.middleware.js";


const router = Router();


// Authentication for all employee routes
router.use(authMiddleware);


// Get employee roles
router.get(
  "/roles",
  requirePermission("EMPLOYEE_READ"),
  employeeController.getRoles
);


// Get employees
router.get(
  "/",
  requirePermission("EMPLOYEE_READ"),
  employeeController.getEmployees
);


// Create employee
router.post(
  "/",
  requirePermission("EMPLOYEE_CREATE"),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);


// Update employee
router.patch(
  "/:id",
  requirePermission("EMPLOYEE_UPDATE"),
  employeeController.updateEmployee
);

router.delete(
  "/:id",
  requirePermission("EMPLOYEE_DELETE"),
  employeeController.deleteEmployee
);

// Change employee password
router.patch(
  "/:id/password",
  requirePermission("EMPLOYEE_UPDATE"),
  validate(changePasswordSchema),
  employeeController.changePassword
);


export default router;