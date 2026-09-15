import bcrypt from "bcryptjs";

import { prisma } from "./src/config/database.js";


const email = "admin@travelcrm.com";
const newPassword = "Admin@123456";


try {

  const passwordHash =
    await bcrypt.hash(newPassword, 12);


  const user =
    await prisma.user.update({

      where: {
        email
      },

      data: {
        passwordHash
      }

    });


  console.log("");
  console.log("=================================");
  console.log("✅ ADMIN PASSWORD RESET SUCCESS");
  console.log("=================================");
  console.log("Email:", user.email);
  console.log("Password:", newPassword);
  console.log("=================================");
  console.log("");

} catch (error) {

  console.error("");
  console.error("❌ Password reset failed:");
  console.error(error);
  console.error("");

} finally {

  await prisma.$disconnect();

}