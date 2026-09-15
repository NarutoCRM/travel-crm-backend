import { prisma } from "../config/database.js";

const createAcceptance = async (data) => {
  return prisma.emailAcceptance.create({
    data
  });
};

const findByEmailId = async (emailId) => {
  return prisma.emailAcceptance.findUnique({
    where: {
      emailId
    }
  });
};

export {
  createAcceptance,
  findByEmailId
};