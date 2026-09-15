import * as permissionRepository from "../repositories/permission.repository.js";

const getPermissions = async () => {
  return permissionRepository.findAll();
};

const getPermissionById = async (id) => {
  const permission =
    await permissionRepository.findById(id);

  if (!permission) {
    throw new Error("Permission not found");
  }

  return permission;
};

export {
  getPermissions,
  getPermissionById
};