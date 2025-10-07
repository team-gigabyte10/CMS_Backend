const { validationResult } = require('express-validator');
const Unit = require('../models/Unit');
class UnitController {
    // Get all units
    static async getAllUnits(req, res, next) {
        try {
            const { page = 1, limit = 50, search = '', parent_id = null, tree = 'false', include_inactive = 'false' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                parent_id,
                include_inactive: include_inactive === 'true'
            };
            let units;
            if (tree === 'true') {
                units = await Unit.getUnitTree(options);
            }
            else {
                units = await Unit.findAll(options);
            }
            const statistics = await Unit.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Units retrieved successfully',
                data: {
                    units: tree === 'true' ? units : units.map(unit => unit.toJSON()),
                    statistics,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: Array.isArray(units) ? units.length : 0
                    },
                    filters: {
                        search,
                        parent_id,
                        tree: tree === 'true',
                        include_inactive: include_inactive === 'true'
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get unit by ID
    static async getUnitById(req, res, next) {
        try {
            const { id } = req.params;
            const unit = await Unit.findById(id);
            if (!unit) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Unit not found'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'Unit retrieved successfully',
                data: {
                    unit: unit.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create new unit
    static async createUnit(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { name, code, description, parent_id } = req.body;
            const created_by = req.user ? req.user.id : 1; // Default to user ID 1 for testing
            // Check if code already exists
            const codeExists = await Unit.codeExists(code);
            if (codeExists) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Unit code already exists'
                });
            }
            // If parent_id is provided, verify it exists
            if (parent_id && parent_id !== null && parent_id !== '') {
                const parentUnit = await Unit.findById(parent_id);
                if (!parentUnit) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Parent unit not found'
                    });
                }
            }
            // Prepare data for creation, ensuring undefined values are handled
            const unitData = {
                name,
                code,
                description: description || null,
                parent_id: parent_id || null,
                created_by
            };
            const unitId = await Unit.create(unitData);
            const newUnit = await Unit.findById(unitId);
            res.status(201).json({
                status: 'success',
                message: 'Unit created successfully',
                data: {
                    unit: newUnit.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update unit
    static async updateUnit(req, res, next) {
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
            // Check if unit exists
            const unit = await Unit.findById(id);
            if (!unit) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Unit not found'
                });
            }
            // If code is being updated, check if it already exists
            if (updateData.code && updateData.code !== unit.code) {
                const codeExists = await Unit.codeExists(updateData.code, id);
                if (codeExists) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Unit code already exists'
                    });
                }
            }
            // If parent_id is being updated, verify it exists and prevent circular reference
            if (updateData.parent_id) {
                if (parseInt(updateData.parent_id) === parseInt(id)) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Unit cannot be its own parent'
                    });
                }
                const parentUnit = await Unit.findById(updateData.parent_id);
                if (!parentUnit) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Parent unit not found'
                    });
                }
            }
            const updated = await Unit.update(id, updateData);
            if (!updated) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Unit not found or no changes made'
                });
            }
            const updatedUnit = await Unit.findById(id);
            res.status(200).json({
                status: 'success',
                message: 'Unit updated successfully',
                data: {
                    unit: updatedUnit.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete unit
    static async deleteUnit(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Unit.delete(id);
            if (!deleted) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Unit not found'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'Unit deleted successfully'
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
    // Get unit children
    static async getUnitChildren(req, res, next) {
        try {
            const { id } = req.params;
            const children = await Unit.getChildren(id);
            res.status(200).json({
                status: 'success',
                message: 'Unit children retrieved successfully',
                data: {
                    parent_id: parseInt(id),
                    children: children.map(child => child.toJSON()),
                    total: children.length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get unit statistics
    static async getUnitStatistics(req, res, next) {
        try {
            const statistics = await Unit.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Unit statistics retrieved successfully',
                data: {
                    statistics
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = UnitController;
//# sourceMappingURL=unitController.js.map