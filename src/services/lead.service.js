import * as leadRepository from "../repositories/lead.repository.js";

import {
  generateLeadCode,
  parseTravelDate
} from "../helpers/lead.helper.js";


const hasPermission = (
  permissions = [],
  permission
) => {
  return (
    permissions.includes("*") ||
    permissions.includes(permission)
  );
};


const filterLeadFields = ({
  lead,
  permissions = [],
  isSuperAdmin = false
}) => {

  if (!lead) {
    return lead;
  }


  if (
    isSuperAdmin ||
    permissions.includes("*")
  ) {
    /*
     * Never expose full card number,
     * even to Super Admin.
     */
    if (Array.isArray(lead.emails)) {
      lead.emails =
        lead.emails.map((email) => {
          const safeEmail = {
            ...email
          };

          delete safeEmail.cardNumber;

          return safeEmail;
        });
    }

    return lead;
  }


  const filteredLead = {
    ...lead
  };


  /*
  |--------------------------------------------------------------------------
  | CLIENT INFORMATION
  |--------------------------------------------------------------------------
  */

  if (
    !hasPermission(
      permissions,
      "LEAD_CLIENT_NAME_READ"
    )
  ) {
    delete filteredLead.clientName;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_CLIENT_EMAIL_READ"
    )
  ) {
    delete filteredLead.clientEmail;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_CLIENT_PHONE_READ"
    )
  ) {
    delete filteredLead.clientPhone;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_DESTINATION_READ"
    )
  ) {
    delete filteredLead.destination;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_TRAVEL_DATE_READ"
    )
  ) {
    delete filteredLead.travelDate;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_TRAVEL_REQUIREMENT_READ"
    )
  ) {
    delete filteredLead.travelRequirement;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_NOTES_READ"
    )
  ) {
    delete filteredLead.notes;
  }


  /*
  |--------------------------------------------------------------------------
  | LEAD INFORMATION
  |--------------------------------------------------------------------------
  */

  if (
    !hasPermission(
      permissions,
      "LEAD_CODE_READ"
    )
  ) {
    delete filteredLead.leadCode;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_STATUS_READ"
    )
  ) {
    delete filteredLead.status;
  }


  if (
    !hasPermission(
      permissions,
      "LEAD_CREATED_BY_READ"
    )
  ) {
    delete filteredLead.createdBy;
    delete filteredLead.createdById;
  }


  /*
  |--------------------------------------------------------------------------
  | EMAIL SENT
  |--------------------------------------------------------------------------
  */

  if (
    !hasPermission(
      permissions,
      "EMAIL_SENT_READ"
    )
  ) {
    /*
     * Email Sent is represented
     * through Lead.status = EMAIL_SENT.
     *
     * Don't expose status through
     * another field.
     */
  }


  /*
  |--------------------------------------------------------------------------
  | CUSTOMER ACCEPTANCE
  |--------------------------------------------------------------------------
  */

  if (
    Array.isArray(
      filteredLead.emails
    )
  ) {

    filteredLead.emails =
      filteredLead.emails.map(
        (email) => {

          const filteredEmail = {
            ...email
          };


          /*
           * Acceptance
           */

          if (
            filteredEmail.acceptance
          ) {

            const acceptance = {
              ...filteredEmail.acceptance
            };


            if (
              !hasPermission(
                permissions,
                "ACCEPTANCE_STATUS_READ"
              )
            ) {
              delete acceptance.accepted;
            }


            if (
              !hasPermission(
                permissions,
                "ACCEPTANCE_IP_READ"
              )
            ) {
              delete acceptance.ipAddress;
            }


            if (
              !hasPermission(
                permissions,
                "ACCEPTANCE_USER_AGENT_READ"
              )
            ) {
              delete acceptance.userAgent;
            }


            if (
              !hasPermission(
                permissions,
                "EMAIL_ACCEPTED_AT_READ"
              )
            ) {
              delete acceptance.acceptedAt;
            }


            filteredEmail.acceptance =
              acceptance;
          }


          /*
           * Email History
           */

          if (
            !hasPermission(
              permissions,
              "EMAIL_RECIPIENT_READ"
            )
          ) {
            delete filteredEmail.recipientEmail;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_SUBJECT_READ"
            )
          ) {
            delete filteredEmail.subject;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_STATUS_READ"
            )
          ) {
            delete filteredEmail.status;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_SENT_AT_READ"
            )
          ) {
            delete filteredEmail.sentAt;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_ACCEPTED_AT_READ"
            )
          ) {
            delete filteredEmail.acceptedAt;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_ACCEPTANCE_IP_READ"
            )
          ) {
            delete filteredEmail.acceptanceIp;
            delete filteredEmail.acceptanceIP;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_SENT_BY_READ"
            )
          ) {
            delete filteredEmail.sentBy;
            delete filteredEmail.sentById;
          }


          if (
            !hasPermission(
              permissions,
              "EMAIL_VIEW_READ"
            )
          ) {
            delete filteredEmail.htmlBody;
          }


          /*
           * Payment
           */

          if (
            !hasPermission(
              permissions,
              "CARD_DETAILS_READ"
            )
          ) {
            delete filteredEmail.cardLast4;
            delete filteredEmail.cardExpiry;
          }


          /*
           * NEVER expose full PAN.
           */

          delete filteredEmail.cardNumber;


          return filteredEmail;
        }
      );
  }


  return filteredLead;
};


/*
|--------------------------------------------------------------------------
| LEAD FUNCTIONS
|--------------------------------------------------------------------------
*/

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
    throw new Error(
      "Created by user is required"
    );
  }


  const leadCode =
    generateLeadCode();


  const parsedTravelDate =
    parseTravelDate(
      travelDate
    );


  return leadRepository.createLead({

    leadCode,

    createdById,

    clientName,

    clientEmail,

    clientPhone,

    destination,

    travelDate:
      parsedTravelDate,

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

  const safePage =
    Math.max(
      Number(page) || 1,
      1
    );


  const allowedLimits =
    [10, 20, 30, 50, 100];


  const requestedLimit =
    Number(limit) || 10;


  const safeLimit =
    allowedLimits.includes(
      requestedLimit
    )
      ? requestedLimit
      : 10;


  return leadRepository.findAll({

    status,

    search,

    clientName,

    page:
      safePage,

    limit:
      safeLimit
  });
};


const getLeadById = async ({
  leadId,
  permissions = [],
  isSuperAdmin = false
}) => {

  const lead =
    await leadRepository.findById(
      leadId
    );


  if (!lead) {
    throw new Error(
      "Lead not found"
    );
  }


  return filterLeadFields({

    lead,

    permissions,

    isSuperAdmin
  });
};


const updateLead = async ({
  leadId,
  data
}) => {

  const existingLead =
    await leadRepository.findById(
      leadId
    );


  if (!existingLead) {
    throw new Error(
      "Lead not found"
    );
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
    await leadRepository.findById(
      leadId
    );


  if (!existingLead) {
    throw new Error(
      "Lead not found"
    );
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