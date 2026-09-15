import {
  getAcceptanceDetails,
  acceptEmail
} from "../services/acceptance.service.js";

const getAcceptance = async (req, res, next) => {
  try {
    const data = await getAcceptanceDetails(
      req.params.token
    );

    res.json({
      success: true,
      message: "Acceptance details fetched successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};

const submitAcceptance = async (req, res, next) => {
  try {
    const forwardedFor =
      req.headers["x-forwarded-for"];

    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers["x-real-ip"] ||
        req.socket.remoteAddress ||
        null;

    const userAgent =
      req.get("user-agent") || null;

    const result = await acceptEmail({
      rawToken: req.params.token,
      accepted: req.body.accepted,
      ipAddress,
      userAgent
    });

    res.json({
      success: true,
      message: result.alreadyAccepted
        ? "This proposal has already been accepted"
        : "Proposal accepted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAcceptance,
  submitAcceptance
};