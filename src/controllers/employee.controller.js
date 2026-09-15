import * as employeeService
  from "../services/employee.service.js";

import {
  successResponse
} from "../helpers/response.helper.js";

const createEmployee = async (req, res, next) => {
  try {
    const employee =
      await employeeService.createEmployee({
        ...req.body,
        createdById: req.user.userId
      });

    return successResponse(
      res,
      employee,
      "Employee created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles =
      await employeeService.getRoles();

    return successResponse(
      res,
      roles,
      "Roles fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees =
      await employeeService.getEmployees();

    return successResponse(
      res,
      employees,
      "Employees fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee =
      await employeeService.updateEmployee({
        employeeId: req.params.id,
        name: req.body.name,
        roleId: req.body.roleId,
        status: req.body.status,
        password: req.body.password
      });

    return successResponse(
      res,
      employee,
      "Employee updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee =
      await employeeService.deleteEmployee({
        employeeId: req.params.id
      });

    return successResponse(
      res,
      employee,
      "Employee deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};


const changePassword = async (req, res, next) => {
  try {
    const employee =
      await employeeService.changeEmployeePassword({
        employeeId: req.params.id,
        newPassword: req.body.password
      });

    return successResponse(
      res,
      employee,
      "Employee password changed successfully"
    );
  } catch (error) {
    next(error);
  }
};


export {
  createEmployee,
  getRoles,
  getEmployees,
  updateEmployee,
  changePassword,
  deleteEmployee
};