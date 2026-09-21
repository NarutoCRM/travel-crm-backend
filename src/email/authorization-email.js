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

  const headerType = $("td").first().find("div").eq(0).text().trim();
  const companyName = $("td").first().find("div").eq(1).text().trim();
  const bookingNumber = $("td")
    .filter((_, el) => $(el).text().includes("BOOKING REF"))
    .find("div")
    .eq(1)
    .text()
    .trim();

  const headerColor = $("#booking-header").css("background-color") || "#c69214";

  return {
    headerType,
    companyName,
    bookingNumber,
    headerColor,
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
    authorizedAt: acceptedAt,
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: data.email,
    subject: `Authorization Confirmed | ${formattedData.companyName} | ${formattedData.headerType} | ${formattedData.bookingNumber}`,
    text: `Dear ${data.sentBy.name},\n\nYour authorization has been confirmed for the booking ${formattedData.bookingNumber}.\n\nThank you,\n${formattedData.companyName}`,
    html: html,
  });
}
