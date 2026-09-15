import * as userRepository from "../repositories/user.repository.js";

import * as roleRepository from "../repositories/role.repository.js";

import { hashPassword } from "../utils/password.util.js";


const createEmployee = async ({
  name,
  email,
  roleId,
  password,
  status = "ACTIVE",
  createdById
}) => {

  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Employee with this email already exists");
  }

  // Find role using roleId
  const employeeRole = await roleRepository.findById(roleId);

  if (!employeeRole) {
    throw new Error("Invalid employee role");
  }

  // Super Admin cannot be assigned
  if (
    employeeRole.name === "SUPER_ADMIN" ||
    employeeRole.name === "Super Admin"
  ) {
    throw new Error("SUPER_ADMIN cannot be assigned to an employee");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create employee
  const employee = await userRepository.createEmployee({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    status,
    roleId: employeeRole.id,
    createdById
  });

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role?.name || employeeRole.name,
    status: employee.status,
    createdAt: employee.createdAt
  };
};


const getRoles = async () => {
  return roleRepository.findAll();
};


const getEmployees = async () => {
  return userRepository.findAllEmployees();
};


// Update employee
const updateEmployee = async ({
  employeeId,
  name,
  roleId,
  status,
  password
}) => {

  // Find employee first
  const employee =
    await userRepository.findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Find selected role
  const employeeRole =
    await roleRepository.findById(roleId);

  if (!employeeRole) {
    throw new Error("Invalid employee role");
  }

  // Super Admin cannot be assigned
  if (
    employeeRole.name === "SUPER_ADMIN" ||
    employeeRole.name === "Super Admin"
  ) {
    throw new Error("SUPER_ADMIN cannot be assigned to an employee");
  }

  const updateData = {
    name: name.trim(),
    roleId: employeeRole.id,
    status
  };

  // Password is optional during employee update
  if (password && password.trim()) {
    updateData.passwordHash =
      await hashPassword(password.trim());
  }

  // Update employee
  const updated =
    await userRepository.updateUser(
      employeeId,
      updateData
    );

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role?.name || employeeRole.name,
    status: updated.status,
    createdAt: updated.createdAt
  };
};


const changeEmployeePassword = async ({
  employeeId,
  newPassword
}) => {

  // Find employee first
  const employee =
    await userRepository.findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Hash new password
  const passwordHash =
    await hashPassword(newPassword);

  // Update employee
  const updated =
    await userRepository.updateUser(
      employeeId,
      {
        passwordHash,
        status: "ACTIVE"
      }
    );

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    status: updated.status
  };
};


export {
  createEmployee,
  getRoles,
  getEmployees,
  updateEmployee,
  changeEmployeePassword
};