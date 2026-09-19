
import { prisma } from "../config/database.js";
import { hashPassword } from "../utils/password.util.js";
import {
    superAdminName,
    superAdminEmail,
    superAdminPassword
} from "../config/env.js"

const permissions = [

  {
    code: "EMPLOYEE_CREATE",
    description: "Create employees"
  },
  {
    code: "EMPLOYEE_READ",
    description: "View employees"
  },
  {
    code: "EMPLOYEE_UPDATE",
    description: "Update employees"
  },
  {
    code: "EMPLOYEE_DELETE",
    description: "Delete employees"
  },
    {
    code: "DASHBOARD_READ",
    description: "View dashboard"
  },

  {
    code: "LEAD_CREATE",
    description: "Create leads"
  },
  {
    code: "LEAD_READ",
    description: "View leads"
  },
  {
    code: "LEAD_UPDATE",
    description: "Update leads"
  },
    {
    code: "LEAD_DELETE",
    description: "Delete leads"
  },

  {
    code: "LEAD_CLIENT_NAME_READ",
    description: "View client name"
  },
  {
    code: "LEAD_CLIENT_EMAIL_READ",
    description: "View client email"
  },
  {
    code: "LEAD_CLIENT_PHONE_READ",
    description: "View client phone"
  },
  {
    code: "LEAD_DESTINATION_READ",
    description: "View destination"
  },
  {
    code: "LEAD_TRAVEL_DATE_READ",
    description: "View travel date"
  },
  {
    code: "LEAD_TRAVEL_REQUIREMENT_READ",
    description: "View travel requirement"
  },
  {
    code: "LEAD_NOTES_READ",
    description: "View lead notes"
  },

  {
    code: "LEAD_CODE_READ",
    description: "View lead code"
  },
  {
    code: "LEAD_STATUS_READ",
    description: "View lead status"
  },
  {
    code: "LEAD_CREATED_BY_READ",
    description: "View lead created by"
  },
  {
    code: "ROLE_CREATE",
    description: "Create roles"
  },
  {
    code: "ROLE_READ",
    description: "View roles"
  },
  {
    code: "ROLE_UPDATE",
    description: "Update roles"
  },
  {
    code: "ROLE_DELETE",
    description: "Delete roles"
  },
  {
    code: "EMAIL_SENT_READ",
    description: "View email sent information"
  },

  {
    code: "EMAIL_CREATE",
    description: "Create email drafts"
  },
  {
    code: "EMAIL_SEND",
    description: "Send emails"
  },
  {
    code: "EMAIL_READ",
    description: "View email records"
  },

  {
    code: "ACCEPTANCE_READ",
    description: "View client acceptance"
  },
  {
    code: "ACCEPTANCE_STATUS_READ",
    description: "View customer acceptance status"
  },
  {
    code: "ACCEPTANCE_IP_READ",
    description: "View customer acceptance IP"
  },
  {
    code: "ACCEPTANCE_USER_AGENT_READ",
    description: "View customer user agent"
  },

  {
    code: "CARD_DETAILS_READ",
    description: "View masked card details"
  },

  {
    code: "EMAIL_RECIPIENT_READ",
    description: "View email recipient"
  },
  {
    code: "EMAIL_SUBJECT_READ",
    description: "View email subject"
  },
  {
    code: "EMAIL_STATUS_READ",
    description: "View email status"
  },
  {
    code: "EMAIL_SENT_AT_READ",
    description: "View email sent time"
  },
  {
    code: "EMAIL_ACCEPTED_AT_READ",
    description: "View email accepted time"
  },
  {
    code: "EMAIL_ACCEPTANCE_IP_READ",
    description: "View email acceptance IP"
  },
  {
    code: "EMAIL_SENT_BY_READ",
    description: "View email sent by"
  },
  {
    code: "EMAIL_VIEW_READ",
    description: "View email content"
  }
];

const roles = [
    {
        name: "SUPER_ADMIN",
        description: "Full system administrator"
    },
    {
        name: "SALES",
        description: "Sales employee"
    }
];

const seed = async () => {
    console.log("🌱 Starting database seed...");

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                code: permission.code
            },
            update: {
                description: permission.description
            },
            create: permission
        });
    }

    for (const role of roles) {
        await prisma.role.upsert({
            where: {
                name: role.name
            },
            update: {
                description: role.description
            },
            create: role
        });
    }

    const superAdmin =
        await prisma.role.findUnique({
            where: {
                name: "SUPER_ADMIN"
            }
        });

    const sales =
        await prisma.role.findUnique({
            where: {
                name: "SALES"
            }
        });

    const allPermissions =
        await prisma.permission.findMany();

    for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdmin.id,
                    permissionId: permission.id
                }
            },
            update: {},
            create: {
                roleId: superAdmin.id,
                permissionId: permission.id
            }
        });
    }

    const salesPermissions = allPermissions.filter(
        (permission) =>
            [
                "LEAD_CREATE",
                "LEAD_READ",
                "LEAD_UPDATE",
                "EMAIL_CREATE",
                "EMAIL_SEND"
            ].includes(permission.code)
    );

    for (const permission of salesPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: sales.id,
                    permissionId: permission.id
                }
            },
            update: {},
            create: {
                roleId: sales.id,
                permissionId: permission.id
            }
        });
    }

    if (
        superAdminEmail &&
        superAdminPassword
    ) {
        const passwordHash =
            await hashPassword(
                superAdminPassword
            );

        await prisma.user.upsert({
            where: {
                email:
                    superAdminEmail.toLowerCase()
            },
            update: {
                name: superAdminName,
                passwordHash,
                roleId: superAdmin.id,
                status: "ACTIVE"
            },
            create: {
                name: superAdminName,
                email:
                    superAdminEmail.toLowerCase(),
                passwordHash,
                roleId: superAdmin.id,
                status: "ACTIVE"
            }
        });
    }

    console.log("✅ Permissions seeded");
    console.log("✅ Roles seeded");
    console.log("✅ Super Admin seeded");
    console.log("🌱 Seed completed");
};

seed()
    .catch((error) => {
        console.error("❌ Seed failed");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });