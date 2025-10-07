const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const {
  sendMessageValidation,
  updateMessageValidation,
  conversationIdValidation,
  messageIdValidation,
  paginationValidation,
  searchValidation,
  dateRangeValidation,
  typingValidation
} = require('../middleware/messageValidation');

// All routes require authentication
router.use(authenticateToken);

// Send a message
router.post('/send', ...sendMessageValidation, MessageController.sendMessage);

// Get messages for a conversation
router.get('/conversation/:conversationId', 
  ...conversationIdValidation, 
  ...paginationValidation, 
  MessageController.getMessages
);

// Mark messages as read
router.put('/conversation/:conversationId/read', 
  ...conversationIdValidation, 
  MessageController.markAsRead
);

// Get unread message count
router.get('/unread/count', MessageController.getUnreadCount);

// Get unread messages
router.get('/unread', MessageController.getUnreadMessages);

// Update a message
router.put('/:messageId', 
  ...messageIdValidation, 
  ...updateMessageValidation, 
  MessageController.updateMessage
);

// Delete a message
router.delete('/:messageId', 
  ...messageIdValidation, 
  MessageController.deleteMessage
);

// Search messages
router.get('/search', 
  ...searchValidation, 
  MessageController.searchMessages
);

// Search messages in specific conversation
router.get('/conversation/:conversationId/search', 
  ...conversationIdValidation, 
  ...searchValidation, 
  MessageController.searchMessages
);

// Get message statistics
router.get('/statistics', 
  ...dateRangeValidation, 
  MessageController.getStatistics
);

// Get message statistics for specific conversation
router.get('/conversation/:conversationId/statistics', 
  ...conversationIdValidation, 
  ...dateRangeValidation, 
  MessageController.getStatistics
);

// Set typing indicator
router.post('/conversation/:conversationId/typing', 
  ...conversationIdValidation, 
  ...typingValidation, 
  MessageController.setTyping
);

module.exports = router;
