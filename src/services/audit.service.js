import * as auditRepository
  from "../repositories/audit.repository.js";

const getRequestIp = (req) => {
  const forwardedFor =
    req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    null
  );
};

const createAudit = async ({
  req,
  userId = null,
  action,
  entity,
  entityId = null,
  metadata = null
}) => {
  try {
    return await auditRepository.createAuditLog({
      userId,
      action,
      entity,
      entityId,
      metadata,
      ipAddress: getRequestIp(req),
      userAgent:
        req.get("user-agent") || null
    });
  } catch (error) {
    // Audit failure should not break the main business operation.
    console.error(
      "⚠️ Audit log failed:",
      error.message
    );

    return null;
  }
};

const getAuditLogs = async (filters = {}) => {
  return auditRepository.findAll(filters);
};

export {
  createAudit,
  getAuditLogs
};