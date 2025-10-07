const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

class NotificationController {
  // Create a new notification
  static async createNotification(notificationData) {
    const {
      user_id,
      title,
      message,
      type = 'info',
      action_url = null
    } = notificationData;

    const query = `
      INSERT INTO notifications (user_id, title, message, type, action_url) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user_id, title, message, type, action_url];

    try {
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Get user notifications
  static async getUserNotifications(req, res) {
    try {
      const { page = 1, limit = 20, type, is_read } = req.query;
      const userId = req.user.id;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT id, title, message, type, is_read, action_url, created_at, read_at
        FROM notifications 
        WHERE user_id = ?
      `;
      const queryParams = [userId];

      if (type) {
        query += ' AND type = ?';
        queryParams.push(type);
      }

      if (is_read !== undefined) {
        query += ' AND is_read = ?';
        queryParams.push(is_read === 'true' ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
      const countParams = [userId];

      if (type) {
        countQuery += ' AND type = ?';
        countParams.push(type);
      }

      if (is_read !== undefined) {
        countQuery += ' AND is_read = ?';
        countParams.push(is_read === 'true' ? 1 : 0);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        status: 'success',
        data: {
          notifications: rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            has_more: pageNum < Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `;

      const [result] = await pool.execute(query, [notificationId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Notification marked as read'
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_read = 0
      `;

      const [result] = await pool.execute(query, [userId]);

      res.json({
        status: 'success',
        message: `${result.affectedRows} notifications marked as read`
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const query = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';

      const [result] = await pool.execute(query, [notificationId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }

  // Get notification statistics
  static async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;

      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read,
          SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info,
          SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning,
          SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END) as error,
          SUM(CASE WHEN type = 'success' THEN 1 ELSE 0 END) as success
        FROM notifications 
        WHERE user_id = ?
      `;

      const [rows] = await pool.execute(query, [userId]);

      res.json({
        status: 'success',
        data: rows[0]
      });

    } catch (error) {
      console.error('Error getting notification statistics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notification statistics',
        error: error.message
      });
    }
  }

  // Send real-time notification
  static async sendRealtimeNotification(userId, notificationData) {
    try {
      const notificationId = await NotificationController.createNotification({
        user_id: userId,
        ...notificationData
      });

      // Get the created notification
      const query = 'SELECT * FROM notifications WHERE id = ?';
      const [rows] = await pool.execute(query, [notificationId]);
      const notification = rows[0];

      return notification;
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      throw error;
    }
  }

  // Broadcast notification to multiple users
  static async broadcastNotification(userIds, notificationData) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notificationId = await NotificationController.createNotification({
          user_id: userId,
          ...notificationData
        });
        notifications.push(notificationId);
      }

      return notifications;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationController;
