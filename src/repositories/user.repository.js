import { prisma } from "../config/database.js";

// ========================================
// FIND USER BY EMAIL
// ========================================

const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });
};

// ========================================
// FIND USER BY ID
// ========================================

const findById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });
};

// ========================================
// FIND ALL EMPLOYEES
// ========================================

const findAllEmployees = async () => {
  return prisma.user.findMany({
    include: {
      role: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

// ========================================
// FIND EMPLOYEE BY ID
// ========================================

const findEmployeeById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id
    },
    include: {
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

// ========================================
// CREATE EMPLOYEE
// ========================================

const createEmployee = async (data) => {
  return prisma.user.create({
    data,
    include: {
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

// ========================================
// UPDATE EMPLOYEE
// ========================================

const updateEmployee = async (id, data) => {
  return prisma.user.update({
    where: {
      id
    },
    data,
    include: {
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

// ========================================
// DELETE EMPLOYEE
// ========================================

const deleteEmployee = async (id) => {
  return prisma.user.delete({
    where: {
      id
    }
  });
};

// ========================================
// UPDATE USER
// Used by authentication service
// ========================================

const updateUser = async (id, data) => {
  return prisma.user.update({
    where: {
      id
    },
    data
  });
};

// ========================================
// UPDATE LAST LOGIN
// ========================================

const updateLastLogin = async (id) => {
  return prisma.user.update({
    where: {
      id
    },
    data: {
      lastLoginAt: new Date()
    }
  });
};

// ========================================
// EXPORTS
// ========================================

export {
  findByEmail,
  findById,
  findAllEmployees,
  findEmployeeById,
  createEmployee,
  updateEmployee,
  updateUser,
  deleteEmployee,
  updateLastLogin
};