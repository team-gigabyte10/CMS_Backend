const { body } = require('express-validator');

// Validation rules for creating a user
const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('rank_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Rank ID must be a positive integer');
      }
      return true;
    }),

  body('service_no')
    .notEmpty()
    .withMessage('Service number is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Service number must not exceed 50 characters'),

  body('unit_id')
    .notEmpty()
    .withMessage('Unit ID is required')
    .isInt({ min: 1 })
    .withMessage('Unit ID must be a positive integer'),

  body('department_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Department ID must be a positive integer');
      }
      return true;
    }),

  body('designation_id')
    .notEmpty()
    .withMessage('Designation ID is required')
    .isInt({ min: 1 })
    .withMessage('Designation ID must be a positive integer'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Phone number contains invalid characters'),

  body('mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mobile number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Mobile number contains invalid characters'),

  body('alternative_mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Alternative mobile number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Alternative mobile number contains invalid characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('parent_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Parent ID must be a positive integer');
      }
      return true;
    }),

  body('role_id')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Role ID must be 1 (Super Admin), 2 (Admin), or 3 (User)'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Validation rules for updating a user
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('rank_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Rank ID must be a positive integer');
      }
      return true;
    }),

  body('service_no')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Service number must not exceed 50 characters'),

  body('unit_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Unit ID must be a positive integer'),

  body('department_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Department ID must be a positive integer');
      }
      return true;
    }),

  body('designation_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Designation ID must be a positive integer'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Phone number contains invalid characters'),

  body('mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mobile number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Mobile number contains invalid characters'),

  body('alternative_mobile')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Alternative mobile number must not exceed 20 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Alternative mobile number contains invalid characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('parent_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!Number.isInteger(Number(value)) || Number(value) < 1) {
        throw new Error('Parent ID must be a positive integer');
      }
      return true;
    }),

  body('role_id')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Role ID must be 1 (Super Admin), 2 (Admin), or 3 (User)'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),

  body('status')
    .optional()
    .isIn(['online', 'offline', 'busy'])
    .withMessage('Status must be online, offline, or busy')
];

module.exports = {
  createUserValidation,
  updateUserValidation
};