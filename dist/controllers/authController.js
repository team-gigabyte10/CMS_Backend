const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const config = require('../config/config');
class AuthController {
    // Login user
    static async login(req, res, next) {
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
            const { email, password } = req.body;
            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }
            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Account is deactivated'
                });
            }
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }
            // Update last seen (format: YYYY-MM-DD HH:mm:ss)
            const now = new Date();
            const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
            await user.update({ last_seen: mysqlDateTime });
            // Get user permissions
            const permissions = await Role.getUserPermissions(user.id);
            // Generate JWT token
            const token = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                role_id: user.role_id,
                name: user.designation
            }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
            // Generate refresh token
            const refreshToken = jwt.sign({
                id: user.id,
                email: user.email
            }, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn });
            // Prepare user data (exclude sensitive information)
            const userData = user.toJSON();
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: {
                        ...userData,
                        role_id: user.role_id,
                        permissions: permissions.map(p => p.name)
                    },
                    token,
                    refreshToken
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Register new user (Admin only)
    static async register(req, res, next) {
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
            const { name, rank_id, service_no, unit_id, department_id, role_id, designation_id, parent_id, phone, mobile, alternative_mobile, email, password } = req.body;
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
            const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
            // Create user
            const userId = await User.create({
                name,
                rank_id,
                service_no,
                unit_id,
                department_id,
                role_id: role_id || 3, // Default to 'User' role (id: 3)
                designation_id,
                parent_id,
                phone,
                mobile,
                alternative_mobile,
                email,
                password_hash: passwordHash
            });
            // Fetch created user
            const newUser = await User.findById(userId);
            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: {
                    user: newUser.toJSON()
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Refresh token
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Refresh token is required'
                });
            }
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwt.secret);
            // Find user
            const user = await User.findById(decoded.id);
            if (!user || !user.is_active) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid refresh token'
                });
            }
            // Generate new access token
            const newToken = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                role_id: user.role_id,
                name: user.name
            }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
            res.status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                data: {
                    token: newToken
                }
            });
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or expired refresh token'
                });
            }
            next(error);
        }
    }
    // Get current user profile
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Get user permissions
            const permissions = await Role.getUserPermissions(userId);
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        ...user.toJSON(),
                        role_id: user.role_id,
                        permissions: permissions.map(p => p.name)
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update user profile
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
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
            // Check if email is being updated and if it's already in use
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await User.findByEmail(updateData.email);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json({
                        status: 'error',
                        message: 'Email is already in use by another user'
                    });
                }
            }
            // Check if service number is being updated and if it's already in use
            if (updateData.service_no && updateData.service_no !== user.service_no) {
                const existingServiceNo = await User.findByServiceNo(updateData.service_no);
                if (existingServiceNo && existingServiceNo.id !== userId) {
                    return res.status(409).json({
                        status: 'error',
                        message: 'Service number is already in use by another user'
                    });
                }
            }
            // Remove sensitive fields that shouldn't be updated through profile update
            const allowedFields = [
                'name', 'rank_id', 'unit_id', 'department_id', 'designation_id',
                'phone', 'mobile', 'alternative_mobile', 'email', 'service_no', 'avatar'
            ];
            const filteredUpdateData = {};
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredUpdateData[key] = updateData[key];
                }
            });
            if (Object.keys(filteredUpdateData).length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No valid fields to update'
                });
            }
            // Update user
            const updated = await user.update(filteredUpdateData);
            if (!updated) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Failed to update profile'
                });
            }
            // Fetch updated user with all related data
            const updatedUser = await User.findById(userId);
            // Get user permissions
            const permissions = await Role.getUserPermissions(userId);
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: {
                    user: {
                        ...updatedUser.toJSON(),
                        role_id: updatedUser.role_id,
                        permissions: permissions.map(p => p.name)
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Change password
    static async changePassword(req, res, next) {
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
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            // Find user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            // Check if new password is different from current password
            if (currentPassword === newPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'New password must be different from current password'
                });
            }
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }
            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
            // Update password
            const updated = await user.updatePassword(newPasswordHash);
            if (!updated) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Failed to update password'
                });
            }
            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Logout (client-side token removal)
    static async logout(req, res, next) {
        try {
            res.status(200).json({
                status: 'success',
                message: 'Logout successful'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = AuthController;
//# sourceMappingURL=authController.js.map