import { z } from "zod";

const createLeadSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Client name is required"),

  clientEmail: z
    .string()
    .trim()
    .email("Invalid client email"),

  clientPhone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  destination: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  travelDate: z
    .string()
    .optional()
    .or(z.literal("")),

  travelRequirement: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
});

const updateLeadSchema = createLeadSchema.partial();

const updateLeadStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "IN_PROGRESS",
    "EMAIL_SENT",
    "ACCEPTED",
    "CLOSED"
  ])
});

export {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema
};