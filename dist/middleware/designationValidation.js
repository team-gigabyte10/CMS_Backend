const { body } = require('express-validator');
// Validation rules for creating a designation
const createDesignationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Designation name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation name must be between 2 and 100 characters'),
    body('department_id')
        .notEmpty()
        .withMessage('Department ID is required')
        .isInt({ min: 1 })
        .withMessage('Department ID must be a positive integer'),
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
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];
// Validation rules for updating a designation
const updateDesignationValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Designation name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation name must be between 2 and 100 characters'),
    body('department_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Department ID must be a positive integer'),
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
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value')
];
module.exports = {
    createDesignationValidation,
    updateDesignationValidation
};
//# sourceMappingURL=designationValidation.js.map