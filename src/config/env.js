import "dotenv/config";

// ============================================================
// Required Environment Variable
// ============================================================

const requiredEnv = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value;
};

// ============================================================
// Environment Configuration
// ============================================================

const env = {
    nodeEnv:
        process.env.NODE_ENV || "development",

    port:
        Number(process.env.PORT || 5000),

    databaseUrl:
        requiredEnv("DATABASE_URL"),

    jwtSecret:
        requiredEnv("JWT_SECRET"),

    jwtExpiresIn:
        process.env.JWT_EXPIRES_IN || "1d",

    frontendUrl:
        requiredEnv("FRONTEND_URL"),

    // ==========================================================
    // SUPER ADMIN
    // ==========================================================

    superAdminName:
        process.env.SUPER_ADMIN_NAME || "Super Admin",

    superAdminEmail:
        process.env.SUPER_ADMIN_EMAIL || "",

    superAdminPassword:
        process.env.SUPER_ADMIN_PASSWORD || "",

    // ==========================================================
    // SMTP
    // ==========================================================

    smtp: {
        host:
            process.env.SMTP_HOST || "",

        port:
            Number(process.env.SMTP_PORT || 587),

        user:
            process.env.SMTP_USER || "",

        password:
            process.env.SMTP_PASSWORD || "",

        from:
            process.env.SMTP_FROM || ""
    }
};

export const {
    superAdminName,
    superAdminEmail,
    superAdminPassword
} = env;

export default env;