import * as userRepository from "../repositories/user.repository.js";

import {
  comparePassword
} from "../utils/password.util.js";

import {
  signToken
} from "../utils/token.util.js";


const login = async ({ email, password }) => {

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email
    .toLowerCase()
    .trim();


  const user =
    await userRepository.findByEmail(normalizedEmail);


  if (!user) {
    throw new Error("Invalid email or password");
  }


  if (user.status !== "ACTIVE") {
    throw new Error("Your account is not active");
  }


  if (!user.passwordHash) {
    throw new Error(
      "Password is not configured for this account"
    );
  }


  const passwordValid =
    await comparePassword(
      password,
      user.passwordHash
    );


  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }


  const permissions =
    user.role?.permissions?.map(
      (item) => item.permission.code
    ) || [];


  const isSuperAdmin =
    user.role?.name === "SUPER_ADMIN" ||
    user.role?.name === "Super Admin";


  const token = signToken({

    userId: user.id,

    employeeCode: user.employeeCode || null,

    roleId: user.roleId,

    role: user.role?.name || null,

    isSuperAdmin

  });


  await userRepository.updateUser(
    user.id,
    {
      lastLoginAt: new Date()
    }
  );


  return {

    token,

    user: {

      id: user.id,

      name: user.name,

      email: user.email,

      status: user.status,

      roleId: user.roleId,

      role: user.role?.name || null,

      isSuperAdmin,

      permissions

    }

  };

};


const getMe = async (userId) => {

  const user =
    await userRepository.findById(userId);


  if (!user) {
    throw new Error("User not found");
  }


  const permissions =
    user.role?.permissions?.map(
      (item) => item.permission.code
    ) || [];


  const isSuperAdmin =
    user.role?.name === "SUPER_ADMIN" ||
    user.role?.name === "Super Admin";


  return {

    id: user.id,

    name: user.name,

    email: user.email,

    status: user.status,

    roleId: user.roleId,

    role: user.role?.name || null,

    isSuperAdmin,

    permissions

  };

};


export {
  login,
  getMe
};