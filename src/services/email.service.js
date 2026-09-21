import crypto from "crypto";

import * as emailRepository from "../repositories/email.repository.js";
import * as leadRepository from "../repositories/lead.repository.js";
import * as acceptanceRepository from "../repositories/acceptance.repository.js";

import path from "path";
import fs from "fs";
import { transporter } from "../config/mail.js";
import env from "../config/env.js";

/*
|--------------------------------------------------------------------------
| TOKEN HELPERS
|--------------------------------------------------------------------------
*/

const createAcceptanceToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/*
|--------------------------------------------------------------------------
| PLACEHOLDER REPLACEMENT
|--------------------------------------------------------------------------
*/

const replacePlaceholders = (text, values) => {
  return String(text || "")
    .replaceAll("{pax}", values.pax || "")
    .replaceAll("{agency}", values.agency || "Reservations Desk")
    .replaceAll("{airline}", values.airline || "")
    .replaceAll("{amount}", values.amount || "")
    .replaceAll("{last4}", values.last4 || "____");
};

/*
|--------------------------------------------------------------------------
| PERMISSION HELPERS
|--------------------------------------------------------------------------
*/

const hasPermission = (permissions = [], permission) => {
  return permissions.includes("*") || permissions.includes(permission);
};

/*
|--------------------------------------------------------------------------
| FILTER EMAIL RECORD
|--------------------------------------------------------------------------
*/

const filterEmailRecord = ({
  email,
  permissions = [],
  isSuperAdmin = false,
}) => {
  if (!email) {
    return email;
  }

  /*
   * SUPER ADMIN
   *
   * Full access except FULL CARD NUMBER.
   */

  if (isSuperAdmin || permissions.includes("*")) {
    const safeEmail = {
      ...email,
    };

    // Never expose full card number
    delete safeEmail.cardNumber;

    return safeEmail;
  }

  const filteredEmail = {
    ...email,
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL HISTORY
  |--------------------------------------------------------------------------
  */

  if (!hasPermission(permissions, "EMAIL_RECIPIENT_READ")) {
    delete filteredEmail.recipientEmail;
  }

  if (!hasPermission(permissions, "EMAIL_SUBJECT_READ")) {
    delete filteredEmail.subject;
  }

  if (!hasPermission(permissions, "EMAIL_STATUS_READ")) {
    delete filteredEmail.status;
  }

  if (!hasPermission(permissions, "EMAIL_SENT_AT_READ")) {
    delete filteredEmail.sentAt;
  }

  if (!hasPermission(permissions, "EMAIL_ACCEPTED_AT_READ")) {
    delete filteredEmail.acceptedAt;
  }

  /*
  |--------------------------------------------------------------------------
  | ACCEPTANCE
  |--------------------------------------------------------------------------
  */

  if (filteredEmail.acceptance) {
    const acceptance = {
      ...filteredEmail.acceptance,
    };

    if (!hasPermission(permissions, "ACCEPTANCE_STATUS_READ")) {
      delete acceptance.accepted;
    }

    if (!hasPermission(permissions, "ACCEPTANCE_IP_READ")) {
      delete acceptance.ipAddress;
    }

    if (!hasPermission(permissions, "ACCEPTANCE_USER_AGENT_READ")) {
      delete acceptance.userAgent;
    }

    if (!hasPermission(permissions, "EMAIL_ACCEPTED_AT_READ")) {
      delete acceptance.acceptedAt;
    }

    filteredEmail.acceptance = acceptance;
  }

  /*
  |--------------------------------------------------------------------------
  | SENT BY
  |--------------------------------------------------------------------------
  */

  if (!hasPermission(permissions, "EMAIL_SENT_BY_READ")) {
    delete filteredEmail.sentBy;
    delete filteredEmail.sentById;
  }

  /*
  |--------------------------------------------------------------------------
  | VIEW EMAIL
  |--------------------------------------------------------------------------
  */

  if (!hasPermission(permissions, "EMAIL_VIEW_READ")) {
    delete filteredEmail.htmlBody;
  }

  /*
  |--------------------------------------------------------------------------
  | PAYMENT INFORMATION
  |--------------------------------------------------------------------------
  */

  if (!hasPermission(permissions, "CARD_DETAILS_READ")) {
    delete filteredEmail.cardLast4;
    delete filteredEmail.cardExpiry;
  }

  /*
   * FULL CARD NUMBER NEVER GOES TO CLIENT
   */
  delete filteredEmail.cardNumber;

  return filteredEmail;
};

const filterEmailRecords = ({
  emails,
  permissions = [],
  isSuperAdmin = false,
}) => {
  if (!Array.isArray(emails)) {
    return emails;
  }

  return emails.map((email) =>
    filterEmailRecord({
      email,
      permissions,
      isSuperAdmin,
    }),
  );
};

/*
|--------------------------------------------------------------------------
| SEND EMAIL
|--------------------------------------------------------------------------
*/

const sendEmail = async ({
  leadId,
  sentById,
  subject,
  htmlBody,
  recipientEmail,
  draft,
  cardLast4,
  cardExpiry,
}) => {
  if (!sentById) {
    throw new Error("Sending employee is required");
  }

  if (!recipientEmail) {
    throw new Error("Recipient email is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!htmlBody) {
    throw new Error("Email HTML body is required");
  }

  /*
  |--------------------------------------------------------------------------
  | FIND OR CREATE LEAD
  |--------------------------------------------------------------------------
  */

  let lead;

  if (leadId) {
    lead = await leadRepository.findById(leadId);

    if (!lead) {
      throw new Error("Lead not found");
    }
  } else {
    const firstPassenger = draft?.passengers?.find((p) => p?.name?.trim());

    lead = await leadRepository.createLead({
      leadCode: `LEAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdById: sentById,
      clientName: firstPassenger?.name?.trim() || "Passenger",
      clientEmail: recipientEmail,
      destination: "",
      travelDate: null,
      travelRequirement: draft?.itineraryText || "",
      notes: "",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE ACCEPTANCE TOKEN
  |--------------------------------------------------------------------------
  */

  const rawToken = createAcceptanceToken();

  const tokenHash = hashToken(rawToken);

  const acceptanceUrl = `${env.frontendUrl}/accept/${rawToken}`;

  /*
  |--------------------------------------------------------------------------
  | PLACEHOLDER VALUES
  |--------------------------------------------------------------------------
  */

  const firstPassenger = draft?.passengers?.find((p) => p?.name?.trim());

  const values = {
    pax: firstPassenger?.name?.trim() || "Passenger",

    agency: "Reservations Desk",

    airline: draft?.airline || "",

    amount: String(draft?.currency || "USD"),

    last4: cardLast4 || "",
  };

  /*
  |--------------------------------------------------------------------------
  | FINAL HTML
  |--------------------------------------------------------------------------
  */

  let finalHtml = String(htmlBody || "");

  finalHtml = finalHtml
    .replaceAll("{{ACCEPTANCE_URL}}", acceptanceUrl)
    .replaceAll('href="#"', `href="${acceptanceUrl}"`);

  /*
  |--------------------------------------------------------------------------
  | CREATE EMAIL RECORD
  |--------------------------------------------------------------------------
  */

  const emailRecord = await emailRepository.createEmail({
    leadId: lead.id,
    sentById,
    recipientEmail,
    subject,
    htmlBody: finalHtml,
    cardLast4: cardLast4 || null,
    cardExpiry: cardExpiry || null,
    /*
     * DO NOT SAVE FULL CARD NUMBER
     */
    acceptanceTokenHash: tokenHash,
    acceptanceExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "SENT",
  });

  /*
  |--------------------------------------------------------------------------
  | DATA IMAGE → CID
  |--------------------------------------------------------------------------
  */

  const convertDataImagesToCid = (html) => {
    const attachments = [];

    let index = 0;

    const convertedHtml = String(html || "").replace(
      /src=["']data:image\/([a-zA-Z0-9.+-]+);base64,([^"']+)["']/gi,
      (match, imageType, base64Data) => {
        index += 1;

        const extension =
          imageType.toLowerCase() === "jpeg" ? "jpg" : imageType.toLowerCase();

        const cid = `travelcrm-image-${Date.now()}-${index}@travelcrm`;

        attachments.push({
          filename: `travelcrm-image-${index}.${extension}`,

          content: Buffer.from(base64Data, "base64"),

          contentType: `image/${imageType}`,

          contentDisposition: "inline",

          cid,
        });

        return `src="cid:${cid}"`;
      },
    );

    return {
      html: convertedHtml,
      attachments,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | SMTP
  |--------------------------------------------------------------------------
  */

  const preparedEmail = convertDataImagesToCid(finalHtml);

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: recipientEmail,
      subject,
      html: preparedEmail.html,
      attachments: preparedEmail.attachments,
    });

    await emailRepository.updateStatus(emailRecord.id, "SENT");
    await leadRepository.updateLead(lead.id, {
      status: "EMAIL_SENT",
    });
  } catch (error) {
    await emailRepository.updateStatus(emailRecord.id, "FAILED");
    throw error;
  }

  return {
    id: emailRecord.id,
    leadId: lead.id,
    recipientEmail,
    subject,
    status: "SENT",
    sentAt: emailRecord.sentAt,
  };
};

/*
|--------------------------------------------------------------------------
| GET EMAILS
|--------------------------------------------------------------------------
*/

const getEmails = async ({
  userId,
  isSuperAdmin,
  status,
  permissions = [],
}) => {
  const emails = await emailRepository.findAll({
    userId: isSuperAdmin ? undefined : userId,

    status,
  });

  return filterEmailRecords({
    emails,

    permissions,

    isSuperAdmin,
  });
};

/*
|--------------------------------------------------------------------------
| GET SINGLE EMAIL
|--------------------------------------------------------------------------
*/

const getEmailById = async ({
  emailId,
  userId,
  isSuperAdmin,
  permissions = [],
}) => {
  const email = await emailRepository.findById(emailId);

  if (!email) {
    throw new Error("Email not found");
  }

  /*
   * Normal employee can only
   * access their own email.
   */

  if (!isSuperAdmin && email.sentById !== userId) {
    throw new Error("You are not allowed to view this email");
  }

  return filterEmailRecord({
    email,

    permissions,

    isSuperAdmin,
  });
};

/*
|--------------------------------------------------------------------------
| GET LEAD EMAILS
|--------------------------------------------------------------------------
*/

const getLeadEmails = async ({
  leadId,
  userId,
  isSuperAdmin,
  permissions = [],
}) => {
  const emails = await emailRepository.findByLeadId(
    leadId,

    isSuperAdmin ? undefined : userId,
  );

  return filterEmailRecords({
    emails,

    permissions,

    isSuperAdmin,
  });
};

/*
|--------------------------------------------------------------------------
| ACCEPT EMAIL
|--------------------------------------------------------------------------
*/

function loadTemplate(templateName, variables) {
  const filePath = path.join(process.cwd(), "src", "email", templateName);

  let html = fs.readFileSync(filePath, "utf8");

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");

    html = html.replace(regex, value ?? "");
  });

  return html;
}

const acceptEmail = async ({ token, ipAddress, userAgent }) => {
  if (!token) {
    throw new Error("Authorization token is required");
  }

  const tokenHash = hashToken(token);
  const email = await emailRepository.findByAcceptanceTokenHash(tokenHash);

  if (!email) {
    throw new Error("Invalid or expired authorization link");
  }

  if (email.acceptanceExpiresAt && email.acceptanceExpiresAt < new Date()) {
    throw new Error("Authorization link has expired");
  }

  if (email.status === "ACCEPTED") {
    return {
      alreadyAccepted: true,
      emailId: email.id,
      acceptedAt: email.acceptedAt,
    };
  }

  const acceptedAt = new Date();

  await acceptanceRepository.createAcceptance({
    emailId: email.id,
    accepted: true,
    ipAddress,
    userAgent,
    acceptedAt,
  });

  await emailRepository.updateStatus(email.id, "ACCEPTED");

  await leadRepository.updateLead(email.leadId, {
    status: "ACCEPTED",
  });

  const lead = email.lead;
  const html = loadTemplate("client-authorization.html", {
    clientName: lead.clientName,
    leadCode: lead.leadCode,

    destination: lead.destination,
    travelDate: lead.travelDate
      ? lead.travelDate.toLocaleDateString("en-IN")
      : "DD/MM/YYYY",
    travelRequirement: lead.travelRequirement,

    authorizedAt: new Date().toLocaleString("en-IN"),

    supportEmail: "support@narutotravels.com",
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: email.recipientEmail,
    subject: "Authorization Confirmed | Lead " + lead.leadCode,
    text: "Authorization Confirmed",
    html: html,
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: email.sentBy.email,
    subject: "New Lead Authorization",
    text: "A new lead has been authorized.",
    html: "<b>A new lead has been authorized.</b>",
  });

  return {
    alreadyAccepted: false,
    emailId: email.id,
    acceptedAt,
  };
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export { sendEmail, getEmails, getEmailById, getLeadEmails, acceptEmail };
