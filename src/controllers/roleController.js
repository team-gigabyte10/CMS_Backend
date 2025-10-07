const Role = require('../models/Role')
const { pool } = require('../config/database')

class RoleController {
  // Get all roles
  static async getRoles (req, res, next) {
    try {
      const roles = await Role.findAll()

      res.status(200).json({
        status: 'success',
        data: {
          roles
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get role by ID
  static async getRoleById (req, res, next) {
    try {
      const { id } = req.params
      const role = await Role.findById(id)

      if (!role) {
        return res.status(404).json({
          status: 'error',
          message: 'Role not found'
        })
      }

      res.status(200).json({
        status: 'success',
        data: {
          role
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get role with permissions
  static async getRoleWithPermissions (req, res, next) {
    try {
      const { id } = req.params
      const role = await Role.getRoleWithPermissions(id)

      if (!role) {
        return res.status(404).json({
          status: 'error',
          message: 'Role not found'
        })
      }

      res.status(200).json({
        status: 'success',
        data: {
          role
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get all permissions
  static async getPermissions (req, res, next) {
    try {
      const query = 'SELECT * FROM permissions WHERE is_active = 1 ORDER BY resource, action'
      const [permissions] = await pool.execute(query)

      res.status(200).json({
        status: 'success',
        data: {
          permissions
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get permissions grouped by resource
  static async getPermissionsGrouped (req, res, next) {
    try {
      const query = 'SELECT * FROM permissions WHERE is_active = 1 ORDER BY resource, action'
      const [permissions] = await pool.execute(query)

      // Group permissions by resource
      const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = []
        }
        acc[perm.resource].push(perm)
        return acc
      }, {})

      res.status(200).json({
        status: 'success',
        data: {
          permissions: grouped
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get user permissions
  static async getUserPermissions (req, res, next) {
    try {
      const userId = req.params.userId || req.user.id

      // Only allow users to view their own permissions unless they're admin
      if (userId != req.user.id && req.user.role !== 'Super_admin' && req.user.role !== 'Admin') {
        return res.status(403).json({
          status: 'error',
          message: 'You can only view your own permissions'
        })
      }

      const permissions = await Role.getUserPermissions(userId)

      res.status(200).json({
        status: 'success',
        data: {
          permissions
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Check user permission
  static async checkUserPermission (req, res, next) {
    try {
      const userId = req.params.userId || req.user.id
      const { permission } = req.query

      if (!permission) {
        return res.status(400).json({
          status: 'error',
          message: 'Permission name is required'
        })
      }

      const hasPermission = await Role.userHasPermission(userId, permission)

      res.status(200).json({
        status: 'success',
        data: {
          hasPermission,
          permission
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get all lookup data (for dropdowns)
  static async getLookupData (req, res, next) {
    try {
      const [roles, ranks, units, departments] = await Promise.all([
        pool.execute('SELECT id, name, description, level FROM roles WHERE is_active = 1 ORDER BY level DESC'),
        pool.execute('SELECT id, name, level, description FROM ranks WHERE is_active = 1 ORDER BY level DESC'),
        pool.execute('SELECT id, name, description FROM units WHERE is_active = 1 ORDER BY name'),
        pool.execute('SELECT id, name, description FROM departments WHERE is_active = 1 ORDER BY name')
      ])

      res.status(200).json({
        status: 'success',
        data: {
          roles: roles[0],
          ranks: ranks[0],
          units: units[0],
          departments: departments[0]
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get branches by unit
  static async getBranchesByUnit (req, res, next) {
    try {
      const { unitId } = req.params
      const query = 'SELECT id, name, description FROM branches WHERE unit_id = ? AND is_active = 1 ORDER BY name'
      const [branches] = await pool.execute(query, [unitId])

      res.status(200).json({
        status: 'success',
        data: {
          branches
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get sub-branches by branch
  static async getSubBranchesByBranch (req, res, next) {
    try {
      const { branchId } = req.params
      const query = 'SELECT id, name, description FROM sub_branches WHERE branch_id = ? AND is_active = 1 ORDER BY name'
      const [subBranches] = await pool.execute(query, [branchId])

      res.status(200).json({
        status: 'success',
        data: {
          subBranches
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Get designations by sub-branch
  static async getDesignationsBySubBranch (req, res, next) {
    try {
      const { subBranchId } = req.params
      const query = 'SELECT id, name, description FROM designations WHERE sub_branch_id = ? AND is_active = 1 ORDER BY name'
      const [designations] = await pool.execute(query, [subBranchId])

      res.status(200).json({
        status: 'success',
        data: {
          designations
        }
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = RoleController
