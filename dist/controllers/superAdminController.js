const { validationResult } = require('express-validator');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Role = require('../models/Role');
class SuperAdminController {
    // Get all admins with their contact information
    static async getAllAdmins(req, res, next) {
        try {
            const { page = 1, limit = 50, search = '', branch_id = '', status = '' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                branch: branch_id,
                role: '2', // Admin role ID
                status
            };
            const admins = await User.findAll(options);
            // Get admin statistics
            const statistics = await User.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Admins retrieved successfully',
                data: {
                    admins: admins.map(admin => admin.toJSON()),
                    statistics: {
                        total_admins: statistics.admins,
                        online_admins: admins.filter(admin => admin.status === 'online').length,
                        offline_admins: admins.filter(admin => admin.status === 'offline').length
                    },
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: admins.length
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get all users with their contact information
    static async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 50, search = '', branch_id = '', status = '' } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                branch: branch_id,
                role: '3', // User role ID
                status
            };
            const users = await User.findAll(options);
            // Get user statistics
            const statistics = await User.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Users retrieved successfully',
                data: {
                    users: users.map(user => user.toJSON()),
                    statistics: {
                        total_users: statistics.regular_users,
                        online_users: users.filter(user => user.status === 'online').length,
                        offline_users: users.filter(user => user.status === 'offline').length
                    },
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: users.length
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get contact tree for admin panel display
    static async getAdminContactTree(req, res, next) {
        try {
            const { search = '', contact_type = '', unit_id = '', branch_id = '', role_filter = '' } = req.query;
            const options = {
                search,
                contact_type,
                unit_id,
                branch_id
            };
            // Get contact tree
            const contactTree = await Contact.getContactTree(options);
            // Filter by role if specified
            let filteredTree = contactTree;
            if (role_filter) {
                filteredTree = SuperAdminController.filterTreeByRole(contactTree, role_filter);
            }
            // Get tree statistics
            const statistics = await Contact.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Admin contact tree retrieved successfully',
                data: {
                    contactTree: filteredTree,
                    statistics: {
                        total_contacts: statistics.total_contacts,
                        internal_contacts: statistics.internal_contacts,
                        external_contacts: statistics.external_contacts,
                        root_contacts: statistics.root_contacts,
                        child_contacts: statistics.child_contacts
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get contact tree for user panel display
    static async getUserContactTree(req, res, next) {
        try {
            const { search = '', contact_type = 'internal', // Default to internal for users
            unit_id = '', branch_id = '' } = req.query;
            const options = {
                search,
                contact_type,
                unit_id,
                branch_id
            };
            // Get contact tree (filtered for user view)
            const contactTree = await Contact.getContactTree(options);
            // Get tree statistics (limited for user view)
            const statistics = await Contact.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'User contact tree retrieved successfully',
                data: {
                    contactTree,
                    statistics: {
                        total_contacts: statistics.total_contacts,
                        internal_contacts: statistics.internal_contacts
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create new admin user
    static async createAdmin(req, res, next) {
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
            const { name, rank_id, service_no, unit_id, branch_id, sub_branch_id, department_id, designation_id, phone, mobile, alternative_mobile, email, password } = req.body;
            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    status: 'error',
                    message: 'User with this email already exists'
                });
            }
            // Check if service number already exists
            const existingServiceNo = await User.findByServiceNo(service_no);
            if (existingServiceNo) {
                return res.status(409).json({
                    status: 'error',
                    message: 'User with this service number already exists'
                });
            }
            // Hash password
            const bcrypt = require('bcryptjs');
            const config = require('../config/config');
            const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
            // Create admin user (role_id: 2)
            const userId = await User.create({
                name,
                rank_id,
                service_no,
                unit_id,
                branch_id,
                sub_branch_id,
                department_id,
                role_id: 2, // Admin role
                designation_id,
                phone,
                mobile,
                alternative_mobile,
                email,
                password_hash: passwordHash
            });
            // Fetch created admin
            const newAdmin = await User.findById(userId);
            res.status(201).json({
                status: 'success',
                message: 'Admin created successfully',
                data: {
                    admin: newAdmin.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create new regular user
    static async createUser(req, res, next) {
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
            const { name, rank_id, service_no, unit_id, branch_id, sub_branch_id, department_id, designation_id, phone, mobile, alternative_mobile, email, password, parent_id } = req.body;
            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    status: 'error',
                    message: 'User with this email already exists'
                });
            }
            // Check if service number already exists
            const existingServiceNo = await User.findByServiceNo(service_no);
            if (existingServiceNo) {
                return res.status(409).json({
                    status: 'error',
                    message: 'User with this service number already exists'
                });
            }
            // Hash password
            const bcrypt = require('bcryptjs');
            const config = require('../config/config');
            const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
            // Create regular user (role_id: 3)
            const userId = await User.create({
                name,
                rank_id,
                service_no,
                unit_id,
                branch_id,
                sub_branch_id,
                department_id,
                role_id: 3, // User role
                designation_id,
                phone,
                mobile,
                alternative_mobile,
                email,
                password_hash: passwordHash
            });
            // If parent_id is provided, create contact relationship
            if (parent_id) {
                await Contact.create({
                    name,
                    rank_id,
                    service_no,
                    unit_id,
                    branch_id,
                    sub_branch_id,
                    department_id,
                    designation_id,
                    phone,
                    mobile,
                    alternative_mobile,
                    email,
                    parent_id,
                    contact_type: 'internal',
                    created_by: req.user.id
                });
            }
            // Fetch created user
            const newUser = await User.findById(userId);
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    user: newUser.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update admin/user information
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const updateData = req.body;
            // Update user
            const updated = await user.update(updateData);
            if (!updated) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Failed to update user'
                });
            }
            // Fetch updated user
            const updatedUser = await User.findById(id);
            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: {
                    user: updatedUser.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete admin/user
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Prevent super admin from deleting themselves
            if (user.role_id === 1 && user.id === req.user.id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot delete your own super admin account'
                });
            }
            // Soft delete user
            const deleted = await user.delete();
            if (!deleted) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Failed to delete user'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get user by ID with full details
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Get user permissions
            const permissions = await Role.getUserPermissions(id);
            res.status(200).json({
                status: 'success',
                message: 'User retrieved successfully',
                data: {
                    user: {
                        ...user.toJSON(),
                        permissions: permissions.map(p => p.name)
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get dashboard statistics for super admin
    static async getDashboardStats(req, res, next) {
        try {
            const userStats = await User.getStatistics();
            const contactStats = await Contact.getStatistics();
            res.status(200).json({
                status: 'success',
                message: 'Dashboard statistics retrieved successfully',
                data: {
                    users: userStats,
                    contacts: contactStats,
                    summary: {
                        total_users: userStats.total_users,
                        total_contacts: contactStats.total_contacts,
                        online_users: userStats.online_users,
                        super_admins: userStats.super_admins,
                        admins: userStats.admins,
                        regular_users: userStats.regular_users
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Helper method to filter tree by role
    static filterTreeByRole(tree, roleFilter) {
        const filterNode = (node) => {
            // Check if current node matches role filter
            const matchesRole = roleFilter === 'all' ||
                (roleFilter === 'admin' && node.role_id === 2) ||
                (roleFilter === 'user' && node.role_id === 3) ||
                (roleFilter === 'super_admin' && node.role_id === 1);
            // Filter children recursively
            const filteredChildren = node.children
                ? node.children.map(child => filterNode(child)).filter(child => child !== null)
                : [];
            // Return node if it matches role or has matching children
            if (matchesRole || filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren
                };
            }
            return null;
        };
        return tree.map(node => filterNode(node)).filter(node => node !== null);
    }
    // Bulk operations for users
    static async bulkUpdateUsers(req, res, next) {
        try {
            const { userIds, updateData } = req.body;
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User IDs array is required'
                });
            }
            const results = [];
            const errors = [];
            for (const id of userIds) {
                try {
                    const user = await User.findById(id);
                    if (!user) {
                        errors.push({ id, error: 'User not found' });
                        continue;
                    }
                    const updated = await user.update(updateData);
                    if (updated) {
                        results.push({ id, status: 'updated' });
                    }
                    else {
                        errors.push({ id, error: 'Failed to update' });
                    }
                }
                catch (error) {
                    errors.push({ id, error: error.message });
                }
            }
            res.status(200).json({
                status: 'success',
                message: 'Bulk update operation completed',
                data: {
                    updated: results,
                    errors,
                    summary: {
                        total: userIds.length,
                        updated: results.length,
                        errors: errors.length
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get organizational hierarchy for contact tree
    static async getOrganizationalHierarchy(req, res, next) {
        try {
            const { pool } = require('../config/database');
            // Get all organizational units
            const [units] = await pool.execute('SELECT * FROM units WHERE is_active = 1 ORDER BY name');
            const [branches] = await pool.execute('SELECT * FROM branches WHERE is_active = 1 ORDER BY name');
            const [subBranches] = await pool.execute('SELECT * FROM sub_branches WHERE is_active = 1 ORDER BY name');
            const [departments] = await pool.execute('SELECT * FROM departments WHERE is_active = 1 ORDER BY name');
            const [designations] = await pool.execute('SELECT * FROM designations WHERE is_active = 1 ORDER BY name');
            const [ranks] = await pool.execute('SELECT * FROM ranks WHERE is_active = 1 ORDER BY level DESC');
            res.status(200).json({
                status: 'success',
                message: 'Organizational hierarchy retrieved successfully',
                data: {
                    units,
                    branches,
                    subBranches,
                    departments,
                    designations,
                    ranks
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = SuperAdminController;
//# sourceMappingURL=superAdminController.js.map