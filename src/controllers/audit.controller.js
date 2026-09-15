import {
  getAuditLogs
} from "../services/audit.service.js";

const listAuditLogs = async (
  req,
  res,
  next
) => {
  try {
    const logs = await getAuditLogs({
      userId: req.query.userId,
      entity: req.query.entity,
      action: req.query.action,
      limit: req.query.limit
    });

    return res.json({
      success: true,
      message: "Audit logs fetched successfully",
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

export {
  listAuditLogs
};