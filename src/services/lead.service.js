import * as leadRepository from "../repositories/lead.repository.js";
import {
    generateLeadCode,
    parseTravelDate
} from "../helpers/lead.helper.js";

const createLead = async ({
    clientName,
    clientEmail,
    clientPhone,
    destination,
    travelDate,
    travelRequirement,
    notes,
    createdById
}) => {
    if (!createdById) {
        throw new Error("Created by user is required");
    }

    const leadCode = generateLeadCode();

    const parsedTravelDate = parseTravelDate(travelDate);

    return leadRepository.createLead({
        leadCode,
        createdById,

        clientName,
        clientEmail,
        clientPhone,

        destination,
        travelDate: parsedTravelDate,
        travelRequirement,
        notes
    });
};

const getLeads = async ({
    status,
    search,
    clientName,
    page = 1,
    limit = 10
}) => {
    const safePage = Math.max(Number(page) || 1, 1);

    const allowedLimits = [10, 20, 30, 50, 100];

    const requestedLimit = Number(limit) || 10;

    const safeLimit = allowedLimits.includes(requestedLimit)
        ? requestedLimit
        : 10;

    return leadRepository.findAll({
        status,
        search,
        clientName,
        page: safePage,
        limit: safeLimit
    });
};

const getLeadById = async ({ leadId }) => {
    const lead = await leadRepository.findById(leadId);

    if (!lead) {
        throw new Error("Lead not found");
    }

    return lead;
};

const updateLead = async ({
    leadId,
    data
}) => {
    const existingLead =
        await leadRepository.findById(leadId);

    if (!existingLead) {
        throw new Error("Lead not found");
    }

    return leadRepository.updateLead(
        leadId,
        data
    );
};

const updateLeadStatus = async ({
    leadId,
    status
}) => {
    const existingLead =
        await leadRepository.findById(leadId);

    if (!existingLead) {
        throw new Error("Lead not found");
    }

    return leadRepository.updateLead(
        leadId,
        {
            status
        }
    );
};

export {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    updateLeadStatus
};