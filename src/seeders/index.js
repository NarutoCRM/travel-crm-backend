
import {prisma} from "../config/database.js" ;
import {hashPassword}  from "../utils/password.util.js";
import { superAdminName,
    superAdminEmail,
    superAdminPassword} from "../config/env.js"

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
        code: "EMAIL_CREATE",
        description: "Create email drafts"
    },
    {
        code: "EMAIL_SEND",
        description: "Send emails"
    },
    {
        code: "ACCEPTANCE_READ",
        description: "View client acceptance"
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