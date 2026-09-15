import { prisma } from "../config/database.js";
import { hashToken } from "../utils/token.util.js";

const getAcceptanceDetails = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const email = await prisma.emailRecord.findUnique({
    where: {
      acceptanceTokenHash: tokenHash
    },

    include: {
      lead: true,

      sentBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      acceptance: true
    }
  });

  if (!email) {
    throw new Error("Invalid acceptance link");
  }

  if (
    email.acceptanceExpiresAt &&
    email.acceptanceExpiresAt < new Date()
  ) {
    throw new Error("Acceptance link has expired");
  }

  return {
    id: email.id,
    subject: email.subject,

    clientName: email.lead.clientName,

    leadCode: email.lead.leadCode,

    htmlBody: email.htmlBody,

    status: email.status,

    acceptedAt: email.acceptedAt,

    expiresAt: email.acceptanceExpiresAt
  };
};

const acceptEmail = async ({
  rawToken,
  accepted,
  ipAddress,
  userAgent
}) => {
  if (accepted !== true) {
    throw new Error(
      "Acceptance confirmation is required"
    );
  }

  const tokenHash = hashToken(rawToken);

  return prisma.$transaction(async (tx) => {
    const email = await tx.emailRecord.findUnique({
      where: {
        acceptanceTokenHash: tokenHash
      },

      include: {
        acceptance: true
      }
    });

    if (!email) {
      throw new Error("Invalid acceptance link");
    }

    if (
      email.acceptanceExpiresAt &&
      email.acceptanceExpiresAt < new Date()
    ) {
      throw new Error("Acceptance link has expired");
    }

    if (email.acceptance) {
      return {
        alreadyAccepted: true,
        acceptedAt: email.acceptance.acceptedAt
      };
    }

    const acceptedAt = new Date();

    await tx.emailAcceptance.create({
      data: {
        emailId: email.id,
        accepted: true,
        ipAddress,
        userAgent,
        acceptedAt
      }
    });

    await tx.emailRecord.update({
      where: {
        id: email.id
      },

      data: {
        status: "ACCEPTED",
        acceptedAt
      }
    });

    await tx.lead.update({
      where: {
        id: email.leadId
      },

      data: {
        status: "ACCEPTED"
      }
    });

    return {
      alreadyAccepted: false,
      acceptedAt
    };
  });
};

export {
  getAcceptanceDetails,
  acceptEmail
};