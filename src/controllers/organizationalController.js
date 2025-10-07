const { validationResult } = require('express-validator')
const Unit = require('../models/Unit')
const Designation = require('../models/Designation')
const User = require('../models/User')

// ==================== UNIT CONTROLLERS ====================

// Get all units
const getAllUnits = async (req, res) => {
  try {
    const { search, parent_id, is_active } = req.query
    const options = { search, parent_id, is_active }

    const units = await Unit.findAll(options)

    res.json({
      status: 'success',
      message: 'Units retrieved successfully',
      data: units
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving units',
      error: error.message
    })
  }
}

// Get unit tree structure
const getUnitTree = async (req, res) => {
  try {
    const tree = await Unit.getUnitTree()

    res.json({
      status: 'success',
      message: 'Unit tree retrieved successfully',
      data: tree
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving unit tree',
      error: error.message
    })
  }
}

// Get unit by ID
const getUnitById = async (req, res) => {
  try {
    const { id } = req.params
    const unit = await Unit.findById(id)

    if (!unit) {
      return res.status(404).json({
        status: 'error',
        message: 'Unit not found'
      })
    }

    res.json({
      status: 'success',
      message: 'Unit retrieved successfully',
      data: unit
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving unit',
      error: error.message
    })
  }
}

// Create new unit
const createUnit = async (req, res) => {
  try {
    const unitData = {
      ...req.body,
      created_by: req.user.id
    }

    const unitId = await Unit.create(unitData)
    const newUnit = await Unit.findById(unitId)

    res.status(201).json({
      status: 'success',
      message: 'Unit created successfully',
      data: newUnit
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating unit',
      error: error.message
    })
  }
}

// Update unit
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updated = await Unit.update(id, updateData)

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Unit not found'
      })
    }

    const updatedUnit = await Unit.findById(id)

    res.json({
      status: 'success',
      message: 'Unit updated successfully',
      data: updatedUnit
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating unit',
      error: error.message
    })
  }
}

// Delete unit
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Unit.delete(id)

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Unit not found'
      })
    }

    res.json({
      status: 'success',
      message: 'Unit deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting unit',
      error: error.message
    })
  }
}

// Get unit statistics
const getUnitStatistics = async (req, res) => {
  try {
    const statistics = await Unit.getStatistics()

    res.json({
      status: 'success',
      message: 'Unit statistics retrieved successfully',
      data: statistics
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving unit statistics',
      error: error.message
    })
  }
}

// ==================== DESIGNATION CONTROLLERS ====================

// Get all designations
const getAllDesignations = async (req, res) => {
  try {
    const { search, parent_id, department_id, is_active } = req.query
    const options = { search, parent_id, department_id, is_active }

    const designations = await Designation.findAll(options)

    res.json({
      status: 'success',
      message: 'Designations retrieved successfully',
      data: designations.map(designation => designation.toJSON())
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving designations',
      error: error.message
    })
  }
}

// Get designation tree structure
const getDesignationTree = async (req, res) => {
  try {
    const { department_id } = req.query
    const tree = await Designation.getDesignationTree(department_id)

    res.json({
      status: 'success',
      message: 'Designation tree retrieved successfully',
      data: tree
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving designation tree',
      error: error.message
    })
  }
}

// Get designation by ID
const getDesignationById = async (req, res) => {
  try {
    const { id } = req.params
    const designation = await Designation.findById(id)

    if (!designation) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      })
    }

    res.json({
      status: 'success',
      message: 'Designation retrieved successfully',
      data: designation.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving designation',
      error: error.message
    })
  }
}

// Create new designation
const createDesignation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const designationData = req.body

    const designationId = await Designation.create(designationData)
    const newDesignation = await Designation.findById(designationId)

    res.status(201).json({
      status: 'success',
      message: 'Designation created successfully',
      data: newDesignation.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating designation',
      error: error.message
    })
  }
}

// Update designation
const updateDesignation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const updateData = req.body

    const updated = await Designation.update(id, updateData)

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      })
    }

    const updatedDesignation = await Designation.findById(id)

    res.json({
      status: 'success',
      message: 'Designation updated successfully',
      data: updatedDesignation.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating designation',
      error: error.message
    })
  }
}

// Delete designation
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Designation.delete(id)

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      })
    }

    res.json({
      status: 'success',
      message: 'Designation deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting designation',
      error: error.message
    })
  }
}

// Get designation statistics
const getDesignationStatistics = async (req, res) => {
  try {
    const statistics = await Designation.getStatistics()

    res.json({
      status: 'success',
      message: 'Designation statistics retrieved successfully',
      data: statistics
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving designation statistics',
      error: error.message
    })
  }
}

// ==================== USER CONTROLLERS ====================

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search, unit_id, role_id, status } = req.query
    const options = { search, unit: unit_id, role: role_id, status }

    const users = await User.findAll(options)

    res.json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: users
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving users',
      error: error.message
    })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    res.json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user',
      error: error.message
    })
  }
}

// Create new user
const createUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      created_by: req.user.id
    }

    const userId = await User.create(userData)
    const newUser = await User.findById(userId)

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating user',
      error: error.message
    })
  }
}

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updated = await User.update(id, updateData)

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    const updatedUser = await User.findById(id)

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating user',
      error: error.message
    })
  }
}

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await User.delete(id)

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user',
      error: error.message
    })
  }
}

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const statistics = await User.getStatistics()

    res.json({
      status: 'success',
      message: 'User statistics retrieved successfully',
      data: statistics
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user statistics',
      error: error.message
    })
  }
}

module.exports = {
  // Unit controllers
  getAllUnits,
  getUnitTree,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitStatistics,

  // Designation controllers
  getAllDesignations,
  getDesignationTree,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getDesignationStatistics,

  // User controllers
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStatistics
}
