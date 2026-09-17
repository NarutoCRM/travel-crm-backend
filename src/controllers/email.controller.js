import {
  sendEmail,
  getEmails,
  getEmailById,
  getLeadEmails,
  acceptEmail
} from "../services/email.service.js";


const getUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.user?.sub
  );
};


/*
|--------------------------------------------------------------------------
| CREATE + SEND EMAIL
|--------------------------------------------------------------------------
*/

const createAndSendEmail = async (
  req,
  res,
  next
) => {

  try {

    const {
      leadId,
      subject,
      htmlBody,
      draft,
      recipientEmail,
      cardLast4,
      cardExpiry
    } = req.body;


    const result =
      await sendEmail({

        leadId:
          leadId || null,

        sentById:
          getUserId(req),

        subject,

        htmlBody,

        draft,

        recipientEmail,

        cardLast4,

        cardExpiry
      });


    return res.status(201).json({

      success: true,

      message:
        "Email sent successfully. Waiting for customer authorization.",

      data:
        result
    });

  } catch (error) {

    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| LIST EMAILS
|--------------------------------------------------------------------------
*/

const listEmails = async (
  req,
  res,
  next
) => {

  try {

    const isSuperAdmin =
      req.user?.role ===
      "SUPER_ADMIN";


    const emails =
      await getEmails({

        userId:
          getUserId(req),

        isSuperAdmin,

        status:
          req.query.status,

        permissions:
          req.user?.permissions || []
      });


    return res.json({

      success: true,

      message:
        "Emails fetched successfully",

      data:
        emails
    });

  } catch (error) {

    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE EMAIL
|--------------------------------------------------------------------------
*/

const getEmail = async (
  req,
  res,
  next
) => {

  try {

    const isSuperAdmin =
      req.user?.role ===
      "SUPER_ADMIN";


    const email =
      await getEmailById({

        emailId:
          req.params.id,

        userId:
          getUserId(req),

        isSuperAdmin,

        permissions:
          req.user?.permissions || []
      });


    return res.json({

      success: true,

      message:
        "Email fetched successfully",

      data:
        email
    });

  } catch (error) {

    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET EMAILS FOR LEAD
|--------------------------------------------------------------------------
*/

const getLeadEmailsController =
  async (
    req,
    res,
    next
  ) => {

    try {

      const isSuperAdmin =
        req.user?.role ===
        "SUPER_ADMIN";


      const emails =
        await getLeadEmails({

          leadId:
            req.params.leadId,

          userId:
            getUserId(req),

          isSuperAdmin,

          permissions:
            req.user?.permissions || []
        });


      return res.json({

        success: true,

        message:
          "Lead emails fetched successfully",

        data:
          emails
      });

    } catch (error) {

      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| CUSTOMER ACCEPTANCE
|--------------------------------------------------------------------------
*/

const acceptEmailController =
  async (
    req,
    res,
    next
  ) => {

    try {

      const forwardedFor =
        req.headers[
        "x-forwarded-for"
        ];


      const ipAddress =
        forwardedFor
          ? String(forwardedFor)
            .split(",")[0]
            .trim()
          : req.ip;


      const result =
        await acceptEmail({

          token:
            req.params.token,

          ipAddress,

          userAgent:
            req.get(
              "user-agent"
            ) || null
        });


      return res.json({

        success: true,

        message:
          result.alreadyAccepted
            ? "This authorization was already completed."
            : "Authorization accepted successfully.",

        data:
          result
      });

    } catch (error) {

      next(error);
    }
  };


export {
  createAndSendEmail,
  listEmails,
  getEmail,
  getLeadEmailsController,
  acceptEmailController
};