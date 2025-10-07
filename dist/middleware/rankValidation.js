const { body, param, query } = require('express-validator');
// Rank validation
const validateRank = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name is required and must be between 1 and 100 characters'),
    body('level')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Level must be a non-negative integer'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value')
];
// Rank update validation
const validateRankUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),
    body('level')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Level must be a non-negative integer'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean value')
];
// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer')
];
// Query validation for get all ranks
const validateRankQuery = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters'),
    query('level')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Level must be a non-negative integer'),
    query('is_active')
        .optional()
        .isIn(['true', 'false', ''])
        .withMessage('is_active must be true, false, or empty')
];
module.exports = {
    validateRank,
    validateRankUpdate,
    validateId,
    validateRankQuery
};
//# sourceMappingURL=rankValidation.js.map