const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const { authenticateToken, authorize } = require('../middleware/auth')
const {
  createUserValidation,
  updateUserValidation
} = require('../middleware/userValidation')

// All routes require authentication
router.use(authenticateToken)

// GET /api/users - Get all users
router.get('/', UserController.getAllUsers)

// GET /api/users/statistics - Get user statistics
router.get('/statistics', UserController.getUserStatistics)

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getUserById)

// POST /api/users - Create new user (Admin and Super Admin only)
router.post(
  '/',
  authorize('Super_admin', 'Admin'),
  createUserValidation,
  UserController.createUser
)

// PUT /api/users/:id - Update user (Admin and Super Admin only)
router.put(
  '/:id',
  authorize('Super_admin', 'Admin'),
  updateUserValidation,
  UserController.updateUser
)

// DELETE /api/users/:id - Delete user (Super Admin only)
router.delete(
  '/:id',
  authorize('Super_admin'),
  UserController.deleteUser
)

module.exports = router
