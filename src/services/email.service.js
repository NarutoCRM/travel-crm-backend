import crypto from "crypto";

import * as emailRepository from "../repositories/email.repository.js";
import * as leadRepository from "../repositories/lead.repository.js";
import * as acceptanceRepository from "../repositories/acceptance.repository.js";

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
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

/*
|--------------------------------------------------------------------------
| PLACEHOLDER REPLACEMENT
|--------------------------------------------------------------------------
*/

const replacePlaceholders = (text, values) => {
  return String(text || "")
    .replaceAll("{pax}", values.pax || "")
    .replaceAll(
      "{agency}",
      values.agency || "Reservations Desk"
    )
    .replaceAll("{airline}", values.airline || "")
    .replaceAll("{amount}", values.amount || "")
    .replaceAll("{last4}", values.last4 || "____");
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
}) => {
  /*
   * Basic validation
   */
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
    const firstPassenger =
      draft?.passengers?.find(
        (p) => p?.name?.trim()
      );

    lead = await leadRepository.createLead({
      leadCode: `LEAD-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

      createdById: sentById,

      clientName:
        firstPassenger?.name?.trim() ||
        "Passenger",

      clientEmail: recipientEmail,

      destination: "",

      travelDate: null,

      travelRequirement:
        draft?.itineraryText || "",

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

  const acceptanceUrl =
    `${env.frontendUrl}/accept/${rawToken}`;

  /*
  |--------------------------------------------------------------------------
  | PLACEHOLDER VALUES
  |--------------------------------------------------------------------------
  */

  const firstPassenger =
    draft?.passengers?.find(
      (p) => p?.name?.trim()
    );

  const values = {
    pax:
      firstPassenger?.name?.trim() ||
      "Passenger",

    agency: "Reservations Desk",

    airline:
      draft?.airline || "",

    /*
     * Keep amount based on the currency value
     * already supplied by the builder.
     */
    amount:
      String(draft?.currency || "USD"),

    last4:
      cardLast4 || "",
  };

  /*
  |--------------------------------------------------------------------------
  | PREPARE FINAL HTML
  |--------------------------------------------------------------------------
  */

  let finalHtml = String(htmlBody || "");

  /*
   * React EmailBuilder generates:
   *
   * href="#"
   *
   * Replace it with secure acceptance URL.
   */

  finalHtml = finalHtml
    .replaceAll("{{ACCEPTANCE_URL}}", acceptanceUrl)
    .replaceAll('href="#"', `href="${acceptanceUrl}"`);


  // finalHtml = finalHtml.replaceAll(
  //   'href="#"',
  //   `href="${acceptanceUrl}"`
  // );

  // /*
  //  * Replace dynamic placeholders.
  //  */
  // finalHtml = replacePlaceholders(
  //   finalHtml,
  //   values
  // );

  /*
  |--------------------------------------------------------------------------
  | CREATE EMAIL RECORD
  |--------------------------------------------------------------------------
  */

  const emailRecord =
    await emailRepository.createEmail({
      leadId: lead.id,

      sentById,

      recipientEmail,

      subject,

      htmlBody: finalHtml,

      acceptanceTokenHash: tokenHash,

      acceptanceExpiresAt:
        new Date(
          Date.now() +
          7 * 24 * 60 * 60 * 1000
        ),

      /*
       * Initial state.
       * If SMTP fails below, it will become FAILED.
       */
      status: "SENT",
    });

  const convertDataImagesToCid = (html) => {
    const attachments = [];
    let index = 0;

    const finalHtml = String(html || "").replace(
      /src=["']data:image\/([a-zA-Z0-9.+-]+);base64,([^"']+)["']/gi,
      (match, imageType, base64Data) => {
        index += 1;

        const extension =
          imageType.toLowerCase() === "jpeg"
            ? "jpg"
            : imageType.toLowerCase();

        const cid = `travelcrm-image-${Date.now()}-${index}@travelcrm`;

        attachments.push({
          filename: `travelcrm-image-${index}.${extension}`,
          content: Buffer.from(base64Data, "base64"),
          contentType: `image/${imageType}`,
          contentDisposition: "inline",
          cid,
        });

        return `src="cid:${cid}"`;
      }
    );

    return {
      html: finalHtml,
      attachments,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | SEND EMAIL THROUGH SMTP
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

    /*
     * SMTP send successful.
     */
    await emailRepository.updateStatus(
      emailRecord.id,
      "SENT"
    );

    /*
     * Email has successfully been sent.
     */
    await leadRepository.updateLead(
      lead.id,
      {
        status: "EMAIL_SENT",
      }
    );

  } catch (error) {
    /*
     * SMTP failed.
     */
    await emailRepository.updateStatus(
      emailRecord.id,
      "FAILED"
    );

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | RESPONSE
  |--------------------------------------------------------------------------
  */

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
}) => {
  return emailRepository.findAll({
    /*
     * Super Admin:
     * sees all emails.
     *
     * Employee:
     * sees only emails sent by himself.
     */
    userId: isSuperAdmin
      ? undefined
      : userId,

    status,
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
}) => {
  const email =
    await emailRepository.findById(
      emailId
    );

  if (!email) {
    throw new Error("Email not found");
  }

  /*
   * Employee cannot access another
   * employee's email.
   */
  if (
    !isSuperAdmin &&
    email.sentById !== userId
  ) {
    throw new Error("Permission denied");
  }

  return email;
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
}) => {
  return emailRepository.findByLeadId(
    leadId,
    isSuperAdmin
      ? undefined
      : userId
  );
};

/*
|--------------------------------------------------------------------------
| ACCEPT EMAIL
|--------------------------------------------------------------------------
*/

const acceptEmail = async ({
  token,
  ipAddress,
  userAgent,
}) => {
  if (!token) {
    throw new Error(
      "Authorization token is required"
    );
  }

  /*
   * Hash the raw token.
   */
  const tokenHash = hashToken(token);

  /*
   * Find email by hashed token.
   */
  const email =
    await emailRepository
      .findByAcceptanceTokenHash(
        tokenHash
      );

  if (!email) {
    throw new Error(
      "Invalid or expired authorization link"
    );
  }

  /*
   * Check expiration.
   */
  if (
    email.acceptanceExpiresAt &&
    email.acceptanceExpiresAt < new Date()
  ) {
    throw new Error(
      "Authorization link has expired"
    );
  }

  /*
   * Already accepted.
   */
  if (email.status === "ACCEPTED") {
    return {
      alreadyAccepted: true,

      emailId: email.id,

      acceptedAt:
        email.acceptedAt,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE ACCEPTANCE
  |--------------------------------------------------------------------------
  */

  const acceptedAt = new Date();

  await acceptanceRepository.createAcceptance({
    emailId: email.id,

    accepted: true,

    ipAddress,

    userAgent,

    acceptedAt,
  });

  /*
   * Update email status.
   */
  await emailRepository.updateStatus(
    email.id,
    "ACCEPTED"
  );

  /*
   * Update lead status.
   */
  await leadRepository.updateLead(
    email.leadId,
    {
      status: "ACCEPTED",
    }
  );

  /*
   |--------------------------------------------------------------------------
   | RESPONSE
   |--------------------------------------------------------------------------
   */

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

export {
  sendEmail,
  getEmails,
  getEmailById,
  getLeadEmails,
  acceptEmail,
};