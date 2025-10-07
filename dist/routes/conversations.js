const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');
const { authenticateToken } = require('../middleware/auth');
const { createConversationValidation, conversationIdValidation, userIdValidation, addParticipantValidation, updateConversationValidation } = require('../middleware/conversationValidation');
// All routes require authentication
router.use(authenticateToken);
// Create a new conversation
router.post('/', ...createConversationValidation, ConversationController.createConversation);
// Get user's conversations
router.get('/', ConversationController.getUserConversations);
// Get conversation details
router.get('/:conversationId', ...conversationIdValidation, ConversationController.getConversationDetails);
// Add participant to conversation
router.post('/:conversationId/participants', ...conversationIdValidation, ...addParticipantValidation, ConversationController.addParticipant);
// Remove participant from conversation
router.delete('/:conversationId/participants/:userId', ...conversationIdValidation, ...userIdValidation, ConversationController.removeParticipant);
// Update conversation
router.put('/:conversationId', ...conversationIdValidation, ...updateConversationValidation, ConversationController.updateConversation);
// Delete conversation
router.delete('/:conversationId', ...conversationIdValidation, ConversationController.deleteConversation);
// Get conversation statistics
router.get('/:conversationId/statistics', ...conversationIdValidation, ConversationController.getConversationStatistics);
module.exports = router;
//# sourceMappingURL=conversations.js.map