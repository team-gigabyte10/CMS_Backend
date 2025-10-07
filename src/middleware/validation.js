const { body, param, query } = require('express-validator');

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('service_no')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Service number is required and must be less than 20 characters'),
  body('rank_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rank ID must be a positive integer'),
  body('unit_id')
    .isInt({ min: 1 })
    .withMessage('Unit ID is required and must be a positive integer'),
  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
  body('role_id')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Role ID must be 1 (Super_admin), 2 (Admin), or 3 (User)'),
  body('designation_id')
    .isInt({ min: 1 })
    .withMessage('Designation ID is required and must be a positive integer'),
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be less than 20 characters'),
  body('mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mobile must be less than 20 characters'),
  body('alternative_mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Alternative mobile must be less than 20 characters')
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('service_no')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Service number must be between 1 and 20 characters'),
  body('rank_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rank ID must be a positive integer'),
  body('unit_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Unit ID must be a positive integer'),
  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
  body('designation_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Designation ID must be a positive integer'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be less than 20 characters'),
  body('mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mobile must be less than 20 characters'),
  body('alternative_mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Alternative mobile must be less than 20 characters'),
  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Avatar URL must be less than 500 characters')
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Refresh token validation
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

module.exports = {
  validateLogin,
  validateRegister,
  validateProfileUpdate,
  validateChangePassword,
  validateRefreshToken,
  validateId
};
