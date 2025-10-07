const { body } = require('express-validator');

// Validation rules for creating a contact
const createContactValidation = [
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

  body('login_id')
    .notEmpty()
    .withMessage('Login ID is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Login ID must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Login ID can only contain letters, numbers, dots, underscores, and hyphens'),

  body('unit_id')
    .notEmpty()
    .withMessage('Unit ID is required')
    .isInt({ min: 1 })
    .withMessage('Unit ID must be a positive integer'),

  body('department_id')
    .notEmpty()
    .withMessage('Department ID is required')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('designation_id')
    .notEmpty()
    .withMessage('Designation ID is required')
    .isInt({ min: 1 })
    .withMessage('Designation ID must be a positive integer'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Phone number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Phone number contains invalid characters');
      }
      return true;
    }),

  body('mobile')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Mobile number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Mobile number contains invalid characters');
      }
      return true;
    }),

  body('alternative_mobile')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Alternative mobile number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Alternative mobile number contains invalid characters');
      }
      return true;
    }),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password_hash')
    .notEmpty()
    .withMessage('Password hash is required')
    .trim()
    .isLength({ min: 60, max: 255 })
    .withMessage('Password hash must be between 60 and 255 characters'),

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
    })
];

// Validation rules for updating a contact
const updateContactValidation = [
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

  body('login_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Login ID cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Login ID must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Login ID can only contain letters, numbers, dots, underscores, and hyphens'),

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
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Phone number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Phone number contains invalid characters');
      }
      return true;
    }),

  body('mobile')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Mobile number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Mobile number contains invalid characters');
      }
      return true;
    }),

  body('alternative_mobile')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty or null values
      }
      if (value.length > 20) {
        throw new Error('Alternative mobile number must not exceed 20 characters');
      }
      if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        throw new Error('Alternative mobile number contains invalid characters');
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password_hash')
    .optional()
    .trim()
    .isLength({ min: 60, max: 255 })
    .withMessage('Password hash must be between 60 and 255 characters'),

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
  createContactValidation,
  updateContactValidation
};