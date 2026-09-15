import * as roleRepository from "../repositories/role.repository.js";

const getRoles = async () => {
  return roleRepository.findAll();
};

const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);

  if (!role) {
    throw new Error("Role not found");
  }

  return role;
};

const createRole = async ({
  name,
  description,
  permissionIds
}) => {
  if (!name || !name.trim()) {
    throw new Error("Role name is required");
  }

  const existingRole = await roleRepository.findByName(
    name.trim()
  );

  if (existingRole) {
    throw new Error("Role already exists");
  }

  return roleRepository.createRole({
    name: name.trim(),
    description,
    permissionIds
  });
};

const updateRole = async (
  id,
  {
    name,
    description,
    isActive,
    permissionIds
  }
) => {
  const existingRole = await roleRepository.findById(id);

  if (!existingRole) {
    throw new Error("Role not found");
  }

  if (!name || !name.trim()) {
    throw new Error("Role name is required");
  }

  const duplicateRole =
    await roleRepository.findByName(name.trim());

  if (
    duplicateRole &&
    duplicateRole.id !== id
  ) {
    throw new Error("Role already exists");
  }

  return roleRepository.updateRole(id, {
    name: name.trim(),
    description,
    isActive,
    permissionIds
  });
};

const deleteRole = async (id) => {
  const role = await roleRepository.findById(id);

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.name === "SUPER_ADMIN") {
    throw new Error("SUPER_ADMIN role cannot be deleted");
  }

  if (role._count?.users > 0) {
    throw new Error(
      "Role cannot be deleted while employees are assigned to it"
    );
  }

  return roleRepository.deleteRole(id);
};

export {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};