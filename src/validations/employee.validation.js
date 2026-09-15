import { z } from "zod";

const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  roleId: z
    .string()
    .trim()
    .min(1, "Role is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),

  status: z
    .enum(["INVITED", "ACTIVE", "INACTIVE"])
    .optional()
    .default("INVITED")
});

const updateEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional(),

  roleId: z
    .string()
    .trim()
    .min(1, "Role is required")
    .optional(),

  status: z
    .enum(["INVITED", "ACTIVE", "INACTIVE"])
    .optional()
});

const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
});

export {
  createEmployeeSchema,
  updateEmployeeSchema,
  changePasswordSchema
};