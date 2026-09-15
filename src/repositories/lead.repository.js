import { prisma } from "../config/database.js";

const createLead = async (data) => {
  return prisma.lead.create({
    data: {
      leadCode: data.leadCode,
      createdById: data.createdById,

      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,

      destination: data.destination,
      travelDate: data.travelDate,
      travelRequirement: data.travelRequirement,
      notes: data.notes,

      status: "NEW"
    }
  });
};

const findAll = async ({
  status,
  search,
  clientName,
  page = 1,
  limit = 10
} = {}) => {
  const where = {};

  // Status filter
  if (status) {
    where.status = status;
  }

  // Client-wise filter
  if (clientName) {
    where.clientName = {
      equals: clientName,
      mode: "insensitive"
    };
  }

  // Search filter
  if (search) {
    where.OR = [
      {
        clientName: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        clientEmail: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        leadCode: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        destination: {
          contains: search,
          mode: "insensitive"
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },

        emails: {
          orderBy: {
            createdAt: "desc"
          },
          include: {
            acceptance: true
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      },

      skip,
      take: limit
    }),

    prisma.lead.count({
      where
    })
  ]);

  return {
    data: leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    }
  };
};

const findById = async (id) => {
  return prisma.lead.findUnique({
    where: {
      id
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      emails: {
        orderBy: {
          createdAt: "desc"
        },

        include: {
          acceptance: true
        }
      }
    }
  });
};

const updateLead = async (id, data) => {
  return prisma.lead.update({
    where: {
      id
    },
    data
  });
};

const deleteLead = async (id) => {
  return prisma.lead.delete({
    where: {
      id
    }
  });
};

export {
  createLead,
  findAll,
  findById,
  updateLead,
  deleteLead
};