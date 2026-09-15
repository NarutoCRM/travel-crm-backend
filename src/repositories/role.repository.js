import { prisma } from "../config/database.js";

const findAll = async () => {
  return prisma.role.findMany({
    orderBy: {
      name: "asc"
    },
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  });
};

const findById = async (id) => {
  return prisma.role.findUnique({
    where: {
      id
    },
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  });
};

const findByName = async (name) => {
  return prisma.role.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive"
      }
    }
  });
};

const createRole = async ({
  name,
  description,
  permissionIds = []
}) => {
  return prisma.role.create({
    data: {
      name,
      description: description || null,

      permissions: {
        create: permissionIds.map((permissionId) => ({
          permission: {
            connect: {
              id: permissionId
            }
          }
        }))
      }
    },

    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });
};

const updateRole = async (
  id,
  {
    name,
    description,
    isActive,
    permissionIds = []
  }
) => {
  return prisma.role.update({
    where: {
      id
    },

    data: {
      name,
      description: description || null,
      isActive,

      permissions: {
        deleteMany: {},

        create: permissionIds.map((permissionId) => ({
          permission: {
            connect: {
              id: permissionId
            }
          }
        }))
      }
    },

    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });
};

const deleteRole = async (id) => {
  return prisma.role.delete({
    where: {
      id
    }
  });
};

export {
  findAll,
  findById,
  findByName,
  createRole,
  updateRole,
  deleteRole
};