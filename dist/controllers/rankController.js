const Rank = require('../models/Rank');
const { validationResult } = require('express-validator');
// Get all ranks
const getAllRanks = async (req, res) => {
    try {
        const { search, level, is_active } = req.query;
        const options = { search, level, is_active };
        const ranks = await Rank.findAll(options);
        res.json({
            status: 'success',
            message: 'Ranks retrieved successfully',
            data: ranks
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving ranks',
            error: error.message
        });
    }
};
// Get ranks by level
const getRanksByLevel = async (req, res) => {
    try {
        const ranks = await Rank.findByLevel();
        res.json({
            status: 'success',
            message: 'Ranks retrieved successfully',
            data: ranks
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving ranks',
            error: error.message
        });
    }
};
// Get rank by ID
const getRankById = async (req, res) => {
    try {
        const { id } = req.params;
        const rank = await Rank.findById(id);
        if (!rank) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Rank retrieved successfully',
            data: rank
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving rank',
            error: error.message
        });
    }
};
// Create new rank
const createRank = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { name, level, description } = req.body;
        // Check if rank name already exists
        const existingRank = await Rank.findByName(name);
        if (existingRank) {
            return res.status(409).json({
                status: 'error',
                message: 'Rank with this name already exists'
            });
        }
        const rankData = { name, level, description };
        const rankId = await Rank.create(rankData);
        const newRank = await Rank.findById(rankId);
        res.status(201).json({
            status: 'success',
            message: 'Rank created successfully',
            data: newRank
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating rank',
            error: error.message
        });
    }
};
// Update rank
const updateRank = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const { name, level, description, is_active } = req.body;
        // Check if rank exists
        const existingRank = await Rank.findById(id);
        if (!existingRank) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        // Check if new name already exists (excluding current rank)
        if (name && name !== existingRank.name) {
            const nameExists = await Rank.findByName(name, id);
            if (nameExists) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Rank with this name already exists'
                });
            }
        }
        const updateData = { name, level, description, is_active };
        const updated = await Rank.update(id, updateData);
        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        const updatedRank = await Rank.findById(id);
        res.json({
            status: 'success',
            message: 'Rank updated successfully',
            data: updatedRank
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating rank',
            error: error.message
        });
    }
};
// Delete rank
const deleteRank = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if rank exists
        const existingRank = await Rank.findById(id);
        if (!existingRank) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        const deleted = await Rank.delete(id);
        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Rank deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting rank',
            error: error.message
        });
    }
};
// Get rank statistics
const getRankStatistics = async (req, res) => {
    try {
        const statistics = await Rank.getStatistics();
        res.json({
            status: 'success',
            message: 'Rank statistics retrieved successfully',
            data: statistics
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving rank statistics',
            error: error.message
        });
    }
};
// Get users by rank
const getUsersByRank = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if rank exists
        const rank = await Rank.findById(id);
        if (!rank) {
            return res.status(404).json({
                status: 'error',
                message: 'Rank not found'
            });
        }
        const users = await Rank.getUsersByRank(id);
        res.json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: {
                rank: rank.toJSON(),
                users
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving users by rank',
            error: error.message
        });
    }
};
module.exports = {
    getAllRanks,
    getRanksByLevel,
    getRankById,
    createRank,
    updateRank,
    deleteRank,
    getRankStatistics,
    getUsersByRank
};
//# sourceMappingURL=rankController.js.map