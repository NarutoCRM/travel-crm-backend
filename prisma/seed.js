import { prisma } from "../src/config/database.js";


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

const seed = async () => {
  console.log("🌱 Starting database seed...");

  // --------------------------------
  // 1. Create / update permissions
  // --------------------------------

  const permissionRecords = {};

  for (const permission of permissions) {
    const record = await prisma.permission.upsert({
      where: {
        code: permission.code
      },
      update: {
        description: permission.description
      },
      create: permission
    });

    permissionRecords[permission.code] = record;
  }

  console.log(
    `✅ ${permissions.length} permissions ready`
  );

  // --------------------------------
  // 2. SUPER ADMIN role
  // --------------------------------

  const superAdminRole = await prisma.role.upsert({
    where: {
      name: "SUPER_ADMIN"
    },
    update: {
      description: "Full system access",
      isActive: true
    },
    create: {
      name: "SUPER_ADMIN",
      description: "Full system access",
      isActive: true
    }
  });

  // Give SUPER_ADMIN every permission

  for (const permission of Object.values(permissionRecords)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id
      }
    });
  }

  console.log(
    "✅ SUPER_ADMIN has all permissions"
  );

  // --------------------------------
  // 3. SALES role
  // --------------------------------

  const salesRole = await prisma.role.upsert({
    where: {
      name: "SALES"
    },
    update: {
      description: "Sales team access",
      isActive: true
    },
    create: {
      name: "SALES",
      description: "Sales team access",
      isActive: true
    }
  });

  const salesPermissions = [
    "DASHBOARD_READ",

    "LEAD_CREATE",
    "LEAD_READ",
    "LEAD_UPDATE",

    "EMAIL_CREATE",
    "EMAIL_READ",
    "EMAIL_SEND"
  ];

  for (const code of salesPermissions) {
    const permission =
      permissionRecords[code];

    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: permission.id
      }
    });
  }

  console.log(
    "✅ SALES permissions configured"
  );

  console.log("🌱 Database seed completed");
};

seed()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });