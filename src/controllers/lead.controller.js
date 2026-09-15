import * as leadService from "../services/lead.service.js";

import {
  successResponse
} from "../helpers/response.helper.js";

const getAuthenticatedUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.user?.sub ||
    null
  );
};

const createLead = async (req, res, next) => {
  try {
    const createdById = getAuthenticatedUserId(req);

    if (!createdById) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found"
      });
    }

    const lead = await leadService.createLead({
      ...req.body,
      createdById
    });

    return successResponse(
      res,
      lead,
      "Lead created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const result = await leadService.getLeads({
      status: req.query.status,
      search: req.query.search,
      clientName: req.query.clientName,
      page: req.query.page,
      limit: req.query.limit
    });

    return successResponse(
      res,
      result,
      "Leads fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById({
      leadId: req.params.id
    });

    return successResponse(
      res,
      lead,
      "Lead fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead({
      leadId: req.params.id,
      data: req.body
    });

    return successResponse(
      res,
      lead,
      "Lead updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await leadService.updateLeadStatus({
      leadId: req.params.id,
      status: req.body.status
    });

    return successResponse(
      res,
      lead,
      "Lead status updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export {
  createLead,
  getLeads,
  getLead,
  updateLead,
  updateLeadStatus
};