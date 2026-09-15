import { z } from "zod";

const sendEmailSchema = z.object({
  leadId: z
    .string()
    .min(1, "Lead ID is required"),

  recipientEmail: z
    .string()
    .trim()
    .email("Invalid recipient email"),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(500),

  htmlBody: z
    .string()
    .min(1, "Email HTML is required")
    .max(1000000),

  templateId: z
    .string()
    .optional()
    .nullable()
});

export {
  sendEmailSchema
};