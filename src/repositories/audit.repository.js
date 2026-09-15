import { prisma } from "../config/database.js";

const createAuditLog = async (data) => {
  return prisma.auditLog.create({
    data: {
      userId: data.userId || null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null
    }
  });
};

const findAll = async ({
  userId,
  entity,
  action,
  limit = 100
} = {}) => {
  const where = {};

  if (userId) {
    where.userId = userId;
  }

  if (entity) {
    where.entity = entity;
  }

  if (action) {
    where.action = action;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    take: Math.min(Number(limit) || 100, 500)
  });
};

export {
  createAuditLog,
  findAll
};