import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from "../services/role.service.js";

const listRoles = async (req, res, next) => {
    try {
        const roles = await getRoles();

        res.json({
            success: true,
            message: "Roles fetched successfully",
            data: roles
        });
    } catch (error) {
        next(error);
    }
};

const getRole = async (req, res, next) => {
    try {
        const role = await getRoleById(
            req.params.id
        );

        res.json({
            success: true,
            message: "Role fetched successfully",
            data: role
        });
    } catch (error) {
        next(error);
    }
};

const createNewRole = async (req, res, next) => {
    try {
        const {
            name,
            description,
            permissionIds
        } = req.body;

        const role = await createRole({
            name,
            description,
            permissionIds
        });

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role
        });
    } catch (error) {
        next(error);
    }
};

const editRole = async (req, res, next) => {
    try {
        const {
            name,
            description,
            isActive,
            permissionIds
        } = req.body;

        const role = await updateRole(
            req.params.id,
            {
                name,
                description,
                isActive,
                permissionIds
            }
        );

        res.json({
            success: true,
            message: "Role updated successfully",
            data: role
        });
    } catch (error) {
        next(error);
    }
};

const removeRole = async (req, res, next) => {
    try {
        await deleteRole(
            req.params.id
        );

        res.json({
            success: true,
            message: "Role deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export {
    listRoles,
    getRole,
    createNewRole,
    editRole,
    removeRole
};