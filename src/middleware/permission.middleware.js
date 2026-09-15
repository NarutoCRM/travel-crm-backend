import { prisma } from "../config/database.js";

const permissionMiddleware = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Authentication check
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Super Admin has full access
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      // JWT user ID
      const userId =
        req.user.userId ||
        req.user.id ||
        req.user.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user ID not found"
        });
      }

      // Load user's role + permissions from database
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          status: true,
          role: {
            select: {
              id: true,
              name: true,
              isActive: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      code: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      // Inactive user cannot access protected resources
      if (user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "User account is inactive"
        });
      }

      // Inactive role cannot access protected resources
      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          success: false,
          message: "User role is inactive"
        });
      }

      // Convert DB permissions into permission codes
      const userPermissions =
        user.role.permissions.map(
          (item) => item.permission.code
        );

      // Check required permission
      const hasPermission =
        requiredPermissions.some(
          (permission) =>
            userPermissions.includes(permission)
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Permission denied"
        });
      }

      // Keep permissions available for downstream controllers if needed
      req.user.permissions = userPermissions;

      next();

    } catch (error) {
      console.error(
        "Permission middleware error:",
        error
      );

      next(error);
    }
  };
};

const requirePermission =
  permissionMiddleware;

export {
  permissionMiddleware,
  requirePermission
};