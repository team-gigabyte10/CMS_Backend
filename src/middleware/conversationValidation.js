const { body, param } = require('express-validator')

// Validation rules for creating a conversation
const createConversationValidation = [
  body('type')
    .isIn(['direct', 'group'])
    .withMessage('Conversation type must be either "direct" or "group"'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Conversation name must be between 1 and 255 characters'),

  body('participant_ids')
    .isArray({ min: 1 })
    .withMessage('Participant IDs must be an array with at least one element'),

  body('participant_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each participant ID must be a positive integer')
]

// Validation rules for conversation ID parameter
const conversationIdValidation = [
  param('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer')
]

// Validation rules for user ID parameter
const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
]

// Validation rules for adding a participant
const addParticipantValidation = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
]

// Validation rules for updating a conversation
const updateConversationValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Conversation name must be between 1 and 255 characters')
]

module.exports = {
  createConversationValidation,
  conversationIdValidation,
  userIdValidation,
  addParticipantValidation,
  updateConversationValidation
}
