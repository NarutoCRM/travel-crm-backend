import { prisma } from "../config/database.js";

const findAll = async () => {
  return prisma.permission.findMany({
    orderBy: {
      code: "asc"
    }
  });
};

const findById = async (id) => {
  return prisma.permission.findUnique({
    where: {
      id
    }
  });
};

const findByIds = async (ids = []) => {
  return prisma.permission.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export {
  findAll,
  findById,
  findByIds
};