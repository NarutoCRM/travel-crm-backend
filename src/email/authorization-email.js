import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

import env from "../config/env.js";
import { transporter } from "../config/mail.js";

function loadTemplate(templateName, variables) {
  const filePath = path.join(process.cwd(), "src", "email", templateName);

  let html = fs.readFileSync(filePath, "utf8");

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");

    html = html.replace(regex, value ?? "");
  });

  return html;
}

function getFormattedData(html) {
  const $ = cheerio.load(html);

  const bookingNumber = $("td")
    .filter((_, el) => $(el).text().includes("BOOKING REF"))
    .find("div")
    .eq(1)
    .text()
    .trim();

  return {
    headerType: $("td").first().find("div").eq(1).text().trim(),
    companyName: $("td").first().find("div").eq(1).text().trim(),
    bookingNumber,
    headerColor: $("#booking-header").css("background-color") || "#c69214",
    paymentAmount: $("#amount").text().trim() || "N/A",
  };
}

export async function sendAuthorizationEmail(data, acceptedAt) {
  const formattedData = getFormattedData(data.htmlBody);

  const html = loadTemplate("client-authorization.html", {
    clientName: data.sentBy.name,
    headerType: formattedData.headerType,
    companyName: formattedData.companyName,
    bookingNumber: formattedData.bookingNumber,
    headerColor: formattedData.headerColor,
    paymentAmount: formattedData.paymentAmount,
    // convert in pst
    authorizedAt: new Date(acceptedAt).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
    // ipAddress: data.ipAddress || "N/A",
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: data.recipientEmail,
    subject: `Authorization Confirmed | ${formattedData.companyName} | ${formattedData.headerType} | ${formattedData.bookingNumber}`,
    text: `Dear ${data.sentBy.name},\n\nYour authorization has been confirmed for the booking ${formattedData.bookingNumber}.\n\nThank you,\n${formattedData.companyName}`,
    html: html,
  });
}

export async function sendAuthorizationEmailToAdmin(data, acceptedAt) {
  const formattedData = getFormattedData(data.htmlBody);
  const html = loadTemplate("client-authorization.html", {
    clientName: data.sentBy.name,
    headerType: formattedData.headerType,
    companyName: formattedData.companyName,
    bookingNumber: formattedData.bookingNumber,
    headerColor: formattedData.headerColor,
    paymentAmount: formattedData.paymentAmount,
    // convert in pst
    authorizedAt: new Date(acceptedAt).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
    // ipAddress: data.ipAddress || "N/A",
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: data.sentBy.email,
    subject: `Authorization Confirmed | ${formattedData.companyName} | ${formattedData.headerType} | ${formattedData.bookingNumber}`,
    text: `Dear ${data.sentBy.name},\n\nYour authorization has been confirmed for the booking ${formattedData.bookingNumber}.\n\nThank you,\n${formattedData.companyName}`,
    html: html,
  });
}
