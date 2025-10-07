const { validationResult } = require('express-validator');
const Department = require('../models/Department');
const Unit = require('../models/Unit');
class DepartmentController {
    // Get all departments
    static async getAllDepartments(req, res, next) {
        try {
            const { page = 1, limit = 50, search = '', unit_id = '', include_inactive = 'false', group_by_unit = 'false' } = req.query;
            if (group_by_unit === 'true') {
                const departmentsByUnit = await Department.getDepartmentsByUnit();
                return res.status(200).json({
                    status: 'success',
                    message: 'Departments grouped by unit retrieved successfully',
                    data: {
                        units: departmentsByUnit
                    }
                });
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                unit_id,
                include_inactive: include_inactive === 'true'
            };
            const departments = await Department.findAll(options);
            const statistics = await Department.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Departments retrieved successfully',
                data: {
                    departments: departments.map(dept => dept.toJSON()),
                    statistics,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: departments.length
                    },
                    filters: {
                        search,
                        unit_id,
                        include_inactive: include_inactive === 'true'
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get department by ID
    static async getDepartmentById(req, res, next) {
        try {
            const { id } = req.params;
            const department = await Department.findById(id);
            if (!department) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Department not found'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'Department retrieved successfully',
                data: {
                    department: department.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get departments by unit
    static async getDepartmentsByUnit(req, res, next) {
        try {
            const { unitId } = req.params;
            // Verify unit exists
            const unit = await Unit.findById(unitId);
            if (!unit) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Unit not found'
                });
            }
            const departments = await Department.findByUnit(unitId);
            res.status(200).json({
                status: 'success',
                message: 'Departments retrieved successfully',
                data: {
                    unit: {
                        id: unit.id,
                        name: unit.name,
                        code: unit.code
                    },
                    departments: departments.map(dept => dept.toJSON()),
                    total: departments.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create new department
    static async createDepartment(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { name, unit_id, parent_id, description } = req.body;
            // Verify unit exists
            const unit = await Unit.findById(unit_id);
            if (!unit) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Unit not found'
                });
            }
            // Verify parent department exists (if provided)
            if (parent_id) {
                const parentDepartment = await Department.findById(parent_id);
                if (!parentDepartment) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Parent department not found'
                    });
                }
                // Check if parent department is in the same unit
                if (parentDepartment.unit_id !== unit_id) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Parent department must be in the same unit'
                    });
                }
            }
            // Check if department name already exists in this unit
            const nameExists = await Department.nameExistsInUnit(name, unit_id);
            if (nameExists) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Department name already exists in this unit'
                });
            }
            const departmentId = await Department.create({
                name,
                unit_id,
                parent_id,
                description
            });
            const newDepartment = await Department.findById(departmentId);
            res.status(201).json({
                status: 'success',
                message: 'Department created successfully',
                data: {
                    department: newDepartment.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update department
    static async updateDepartment(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { id } = req.params;
            const updateData = req.body;
            // Check if department exists
            const department = await Department.findById(id);
            if (!department) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Department not found'
                });
            }
            // If unit_id is being updated, verify it exists
            if (updateData.unit_id) {
                const unit = await Unit.findById(updateData.unit_id);
                if (!unit) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Unit not found'
                    });
                }
            }
            // If parent_id is being updated, verify it exists and is valid
            if (updateData.parent_id !== undefined) {
                if (updateData.parent_id) {
                    const parentDepartment = await Department.findById(updateData.parent_id);
                    if (!parentDepartment) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Parent department not found'
                        });
                    }
                    // Check if parent department is in the same unit
                    const targetUnitId = updateData.unit_id || department.unit_id;
                    if (parentDepartment.unit_id !== targetUnitId) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Parent department must be in the same unit'
                        });
                    }
                    // Check for circular references
                    const canBeParent = await Department.canBeParent(id, updateData.parent_id);
                    if (!canBeParent) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Cannot set parent: would create circular reference'
                        });
                    }
                }
            }
            // If name is being updated, check if it already exists in the unit
            if (updateData.name) {
                const targetUnitId = updateData.unit_id || department.unit_id;
                if (updateData.name !== department.name || updateData.unit_id) {
                    const nameExists = await Department.nameExistsInUnit(updateData.name, targetUnitId, id);
                    if (nameExists) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Department name already exists in this unit'
                        });
                    }
                }
            }
            const updated = await Department.update(id, updateData);
            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Department not found or no changes made'
                });
            }
            const updatedDepartment = await Department.findById(id);
            res.status(200).json({
                status: 'success',
                message: 'Department updated successfully',
                data: {
                    department: updatedDepartment.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete department
    static async deleteDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Department.delete(id);
            if (!deleted) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Department not found'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'Department deleted successfully'
            });
        }
        catch (error) {
            if (error.message.includes('Cannot delete')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            next(error);
        }
    }
    // Get department statistics
    static async getDepartmentStatistics(req, res, next) {
        try {
            const statistics = await Department.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Department statistics retrieved successfully',
                data: {
                    statistics
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get department hierarchy
    static async getDepartmentHierarchy(req, res, next) {
        try {
            const { unit_id } = req.query;
            const hierarchy = await Department.getHierarchy(unit_id);
            res.status(200).json({
                status: 'success',
                message: 'Department hierarchy retrieved successfully',
                data: {
                    hierarchy,
                    total_departments: hierarchy.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get child departments
    static async getChildDepartments(req, res, next) {
        try {
            const { id } = req.params;
            // Verify parent department exists
            const parentDepartment = await Department.findById(id);
            if (!parentDepartment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Department not found'
                });
            }
            const children = await Department.getChildren(id);
            res.status(200).json({
                status: 'success',
                message: 'Child departments retrieved successfully',
                data: {
                    parent: parentDepartment.toJSON(),
                    children: children.map(child => child.toJSON()),
                    total_children: children.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = DepartmentController;
//# sourceMappingURL=departmentController.js.map