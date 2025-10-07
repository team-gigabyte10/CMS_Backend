const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  validateLogin,
  validateRegister,
  validateProfileUpdate,
  validateChangePassword,
  validateRefreshToken
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);
router.post('/refresh-token', validateRefreshToken, AuthController.refreshToken);

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

// User profile routes
router.get('/profile', AuthController.getProfile);
router.put('/profile', validateProfileUpdate, AuthController.updateProfile);
router.put('/change-password', validateChangePassword, AuthController.changePassword);
router.post('/logout', AuthController.logout);

// Admin only routes
router.post('/register', validateRegister, authorize('Super_admin', 'Admin'), AuthController.register);

module.exports = router;
