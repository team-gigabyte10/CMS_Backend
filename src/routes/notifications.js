const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { param, query } = require('express-validator');

// All routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['info', 'warning', 'error', 'success']).withMessage('Invalid notification type'),
  query('is_read').optional().isBoolean().withMessage('is_read must be a boolean')
], NotificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', [
  param('notificationId').isInt({ min: 1 }).withMessage('Notification ID must be a positive integer')
], NotificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', [
  param('notificationId').isInt({ min: 1 }).withMessage('Notification ID must be a positive integer')
], NotificationController.deleteNotification);

// Get notification statistics
router.get('/statistics', NotificationController.getNotificationStats);

module.exports = router;
