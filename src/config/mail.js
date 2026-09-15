import nodemailer from "nodemailer";
import env from "./env.js";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,

  auth:
    env.smtp.user && env.smtp.password
      ? {
          user: env.smtp.user,
          pass: env.smtp.password
        }
      : undefined
});

const verifyMailConnection = async () => {
  if (
    !env.smtp.host ||
    !env.smtp.user ||
    !env.smtp.password
  ) {
    console.warn("⚠️ SMTP configuration is incomplete");
    return false;
  }

  try {
    await transporter.verify();

    console.log("✅ SMTP connection verified");

    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed");
    console.error(error.message);

    return false;
  }
};

export {
  transporter,
  verifyMailConnection
};