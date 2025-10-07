const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Unit = require('../models/Unit');
const Department = require('../models/Department');

class UserController {
  // Create new user
  static async createUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        name, rank_id, service_no, unit_id, department_id,
        designation_id, phone, mobile, alternative_mobile,
        email, parent_id, role_id, password
      } = req.body;

      // Verify unit exists
      const unit = await Unit.findById(unit_id);
      if (!unit) {
        return res.status(400).json({
          status: 'error',
          message: 'Unit not found'
        });
      }

      // Verify department exists if provided
      if (department_id) {
        const department = await Department.findById(department_id);
        if (!department) {
          return res.status(400).json({
            status: 'error',
            message: 'Department not found'
          });
        }
        // Verify department belongs to the unit
        if (department.unit_id !== parseInt(unit_id)) {
          return res.status(400).json({
            status: 'error',
            message: 'Department does not belong to the specified unit'
          });
        }
      }

      // Verify parent user exists if provided
      if (parent_id) {
        const parentUser = await User.findById(parent_id);
        if (!parentUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Parent user not found'
          });
        }
        // Verify parent is in the same unit
        if (parentUser.unit_id !== parseInt(unit_id)) {
          return res.status(400).json({
            status: 'error',
            message: 'Parent user must be in the same unit'
          });
        }
      }

      // Check for duplicate service_no
      const existingUser = await User.findByServiceNo(service_no);
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Service number already exists'
        });
      }

      // Check for duplicate email
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password || 'password123', 12);

      const userId = await User.create({
        name,
        rank_id,
        service_no,
        unit_id,
        department_id,
        designation_id,
        phone,
        mobile,
        alternative_mobile,
        email,
        parent_id,
        role_id: role_id || 3,
        password_hash,
        status: 'offline'
      });

      const newUser = await User.findById(userId);

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            service_no: newUser.service_no,
            email: newUser.email,
            unit_id: newUser.unit_id,
            unit_name: newUser.unit_name,
            department_id: newUser.department_id,
            department_name: newUser.department_name,
            designation_id: newUser.designation_id,
            designation_name: newUser.designation_name,
            role_id: newUser.role_id,
            role_name: newUser.role_name,
            parent_id: newUser.parent_id,
            parent_name: newUser.parent_name,
            created_at: newUser.created_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users with filtering
  static async getAllUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        search = '',
        unit_id = '',
        department_id = '',
        role_id = '',
        parent_id = null,
        include_inactive = 'false'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        unit_id,
        department_id,
        role_id,
        parent_id,
        include_inactive: include_inactive === 'true'
      };

      const users = await User.findAll(options);
      const statistics = await User.getStatistics();

      res.status(200).json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            service_no: user.service_no,
            email: user.email,
            unit_name: user.unit_name,
            department_name: user.department_name,
            designation_name: user.designation_name,
            role_name: user.role_name,
            parent_name: user.parent_name,
            is_active: user.is_active,
            status: user.status,
            created_at: user.created_at
          })),
          statistics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length
          },
          filters: {
            search,
            unit_id,
            department_id,
            role_id,
            include_inactive: include_inactive === 'true'
          }
        }
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error retrieving users',
        error: error.message
      });
    }
  }

  // Get user by ID
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

      res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            rank_id: user.rank_id,
            rank_name: user.rank_name,
            service_no: user.service_no,
            unit_id: user.unit_id,
            unit_name: user.unit_name,
            department_id: user.department_id,
            department_name: user.department_name,
            designation_id: user.designation_id,
            designation_name: user.designation_name,
            phone: user.phone,
            mobile: user.mobile,
            alternative_mobile: user.alternative_mobile,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role_name,
            parent_id: user.parent_id,
            parent_name: user.parent_name,
            avatar: user.avatar,
            status: user.status,
            is_active: user.is_active,
            last_seen: user.last_seen,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
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

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
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

      // If department_id is being updated, verify it exists and belongs to unit
      if (updateData.department_id) {
        const department = await Department.findById(updateData.department_id);
        if (!department) {
          return res.status(400).json({
            status: 'error',
            message: 'Department not found'
          });
        }
        const targetUnitId = updateData.unit_id || user.unit_id;
        if (department.unit_id !== parseInt(targetUnitId)) {
          return res.status(400).json({
            status: 'error',
            message: 'Department does not belong to the specified unit'
          });
        }
      }

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 12);
        delete updateData.password;
      }

      const updated = await User.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found or no changes made'
        });
      }

      const updatedUser = await User.findById(id);

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            unit_name: updatedUser.unit_name,
            department_name: updatedUser.department_name,
            designation_name: updatedUser.designation_name,
            role_name: updatedUser.role_name,
            updated_at: updatedUser.updated_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (soft delete)
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user has children
      const children = await User.findByParentId(id);
      if (children.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete user with subordinates. Please reassign or delete subordinates first.'
        });
      }

      const deleted = await User.delete(id);

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  static async getUserStatistics(req, res, next) {
    try {
      const statistics = await User.getStatistics();

      res.status(200).json({
        status: 'success',
        message: 'User statistics retrieved successfully',
        data: {
          statistics
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

