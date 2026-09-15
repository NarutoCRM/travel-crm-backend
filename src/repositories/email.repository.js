import { prisma } from "../config/database.js";

const createEmail = async (data) => {
  return prisma.emailRecord.create({
    data
  });
};

const findById = async (id) => {
  return prisma.emailRecord.findUnique({
    where: {
      id
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

      template: true,

      acceptance: true
    }
  });
};

const findByAcceptanceTokenHash = async (tokenHash) => {
  return prisma.emailRecord.findUnique({
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
};

const findAll = async ({ userId, status } = {}) => {
  const where = {};

  if (userId) {
    where.sentById = userId;
  }

  if (status) {
    where.status = status;
  }

  return prisma.emailRecord.findMany({
    where,

    include: {
      lead: {
        select: {
          id: true,
          leadCode: true,
          clientName: true,
          clientEmail: true,
          status: true
        }
      },

      sentBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      acceptance: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

const findByLeadId = async (leadId, userId) => {
  const where = {
    leadId
  };

  if (userId) {
    where.sentById = userId;
  }

  return prisma.emailRecord.findMany({
    where,

    include: {
      lead: {
        select: {
          id: true,
          leadCode: true,
          clientName: true,
          clientEmail: true,
          status: true
        }
      },

      sentBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      acceptance: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

const updateStatus = async (id, status) => {
  return prisma.emailRecord.update({
    where: {
      id
    },

    data: {
      status
    }
  });
};

export {
  createEmail,
  findById,
  findByAcceptanceTokenHash,
  findAll,
  findByLeadId,
  updateStatus
};