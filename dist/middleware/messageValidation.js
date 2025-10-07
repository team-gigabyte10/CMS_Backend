const { body, param, query } = require('express-validator');
// Validation rules for sending a message
const sendMessageValidation = [
    body('conversation_id')
        .isInt({ min: 1 })
        .withMessage('Conversation ID must be a positive integer'),
    body('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message content must be between 1 and 2000 characters'),
    body('type')
        .optional()
        .isIn(['text', 'system'])
        .withMessage('Message type must be either "text" or "system"')
];
// Validation rules for updating a message
const updateMessageValidation = [
    param('messageId')
        .isInt({ min: 1 })
        .withMessage('Message ID must be a positive integer'),
    body('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message content must be between 1 and 2000 characters')
];
// Validation rules for conversation ID parameter
const conversationIdValidation = [
    param('conversationId')
        .isInt({ min: 1 })
        .withMessage('Conversation ID must be a positive integer')
];
// Validation rules for message ID parameter
const messageIdValidation = [
    param('messageId')
        .isInt({ min: 1 })
        .withMessage('Message ID must be a positive integer')
];
// Validation rules for pagination
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('before_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Before ID must be a positive integer')
];
// Validation rules for search
const searchValidation = [
    query('q')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
];
// Validation rules for date range
const dateRangeValidation = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
];
// Validation rules for typing indicator
const typingValidation = [
    body('isTyping')
        .isBoolean()
        .withMessage('isTyping must be a boolean value')
];
module.exports = {
    sendMessageValidation,
    updateMessageValidation,
    conversationIdValidation,
    messageIdValidation,
    paginationValidation,
    searchValidation,
    dateRangeValidation,
    typingValidation
};
//# sourceMappingURL=messageValidation.js.map