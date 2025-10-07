const { body } = require('express-validator');
// Validation rules for creating a unit
const createUnitValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Unit name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Unit name must be between 2 and 100 characters'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Unit code is required')
        .isLength({ min: 2, max: 20 })
        .withMessage('Unit code must be between 2 and 20 characters')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('Unit code must contain only uppercase letters, numbers, hyphens, and underscores'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
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
// Validation rules for updating a unit
const updateUnitValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Unit name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Unit name must be between 2 and 100 characters'),
    body('code')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Unit code cannot be empty')
        .isLength({ min: 2, max: 20 })
        .withMessage('Unit code must be between 2 and 20 characters')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('Unit code must contain only uppercase letters, numbers, hyphens, and underscores'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
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
        .withMessage('is_active must be a boolean value')
];
module.exports = {
    createUnitValidation,
    updateUnitValidation
};
//# sourceMappingURL=unitValidation.js.map