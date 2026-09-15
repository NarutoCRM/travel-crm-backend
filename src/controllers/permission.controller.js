import {
  getPermissions,
  getPermissionById
} from "../services/permission.service.js";

const listPermissions = async (req, res, next) => {
  try {
    const permissions = await getPermissions();

    res.json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions
    });
  } catch (error) {
    next(error);
  }
};

const getPermission = async (req, res, next) => {
  try {
    const permission =
      await getPermissionById(req.params.id);

    res.json({
      success: true,
      message: "Permission fetched successfully",
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

export {
  listPermissions,
  getPermission
};