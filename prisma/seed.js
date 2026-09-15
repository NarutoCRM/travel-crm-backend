import { prisma } from "../src/config/database.js";


const permissions = [
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
    code: "EMAIL_CREATE",
    description: "Create email records"
  },
  {
    code: "EMAIL_READ",
    description: "View emails"
  },
  {
    code: "EMAIL_SEND",
    description: "Send emails"
  },

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
    code: "ROLE_CREATE",
    description: "Create roles"
  },
  {
    code: "ROLE_READ",
    description: "View roles and permissions"
  },
  {
    code: "ROLE_UPDATE",
    description: "Update roles and permissions"
  },
  {
    code: "ROLE_DELETE",
    description: "Delete roles"
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