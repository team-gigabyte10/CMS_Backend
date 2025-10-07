const { pool } = require('../config/database');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

class DashboardController {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get basic statistics
      const [
        totalContacts,
        activeConversations,
        onlineContacts,
        securityAlerts,
        recentActivity,
        conversationStats,
        userStats
      ] = await Promise.all([
        DashboardController.getTotalContacts(userId, userRole),
        DashboardController.getActiveConversations(userId, userRole),
        DashboardController.getOnlineContacts(userId, userRole),
        DashboardController.getSecurityAlerts(userId, userRole),
        DashboardController.getRecentActivity(userId, userRole),
        DashboardController.getConversationStats(userId, userRole),
        DashboardController.getUserStats(userId, userRole)
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          totalContacts,
          activeConversations,
          onlineContacts,
          securityAlerts,
          recentActivity,
          conversationStats,
          userStats,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get total contacts count
  static async getTotalContacts(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins can see all contacts
        query = `
          SELECT 
            COUNT(*) as total_contacts,
            COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_contacts,
            COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_contacts,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_contacts_30d,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_contacts_7d
          FROM users
        `;
        params = [];
      } else {
        // Regular users see contacts they can communicate with
        query = `
          SELECT 
            COUNT(DISTINCT u.id) as total_contacts,
            COUNT(DISTINCT CASE WHEN u.is_active = 1 THEN u.id END) as active_contacts,
            COUNT(DISTINCT CASE WHEN u.is_active = 0 THEN u.id END) as inactive_contacts,
            COUNT(DISTINCT CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as new_contacts_30d,
            COUNT(DISTINCT CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN u.id END) as new_contacts_7d
          FROM users u
          WHERE u.id != ? AND u.is_active = 1
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting total contacts: ${error.message}`);
    }
  }

  // Get active conversations
  static async getActiveConversations(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins can see all conversations
        query = `
          SELECT 
            COUNT(DISTINCT c.id) as total_conversations,
            COUNT(DISTINCT CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN c.id END) as active_24h,
            COUNT(DISTINCT CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN c.id END) as active_7d,
            COUNT(DISTINCT CASE WHEN c.type = 'direct' THEN c.id END) as direct_conversations,
            COUNT(DISTINCT CASE WHEN c.type = 'group' THEN c.id END) as group_conversations
          FROM conversations c
        `;
        params = [];
      } else {
        // Regular users see their conversations
        query = `
          SELECT 
            COUNT(DISTINCT c.id) as total_conversations,
            COUNT(DISTINCT CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN c.id END) as active_24h,
            COUNT(DISTINCT CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN c.id END) as active_7d,
            COUNT(DISTINCT CASE WHEN c.type = 'direct' THEN c.id END) as direct_conversations,
            COUNT(DISTINCT CASE WHEN c.type = 'group' THEN c.id END) as group_conversations
          FROM conversations c
          JOIN conversation_participants cp ON c.id = cp.conversation_id
          WHERE cp.user_id = ?
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting active conversations: ${error.message}`);
    }
  }

  // Get online contacts
  static async getOnlineContacts(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins can see all online users
        query = `
          SELECT 
            COUNT(CASE WHEN status = 'online' THEN 1 END) as online_now,
            COUNT(CASE WHEN status = 'busy' THEN 1 END) as busy_now,
            COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_now,
            COUNT(CASE WHEN last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1 END) as recently_active,
            COUNT(CASE WHEN last_seen >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as active_1h,
            COUNT(CASE WHEN last_seen >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as active_24h
          FROM users
          WHERE is_active = 1
        `;
        params = [];
      } else {
        // Regular users see online contacts they can communicate with
        query = `
          SELECT 
            COUNT(CASE WHEN u.status = 'online' THEN 1 END) as online_now,
            COUNT(CASE WHEN u.status = 'busy' THEN 1 END) as busy_now,
            COUNT(CASE WHEN u.status = 'offline' THEN 1 END) as offline_now,
            COUNT(CASE WHEN u.last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1 END) as recently_active,
            COUNT(CASE WHEN u.last_seen >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as active_1h,
            COUNT(CASE WHEN u.last_seen >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as active_24h
          FROM users u
          WHERE u.id != ? AND u.is_active = 1
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting online contacts: ${error.message}`);
    }
  }

  // Get security alerts
  static async getSecurityAlerts(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins see all security-related activities
        query = `
          SELECT 
            COUNT(CASE WHEN action LIKE '%LOGIN%' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as failed_logins_24h,
            COUNT(CASE WHEN action LIKE '%LOGIN%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as failed_logins_7d,
            COUNT(CASE WHEN action LIKE '%PASSWORD%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as password_changes_7d,
            COUNT(CASE WHEN action LIKE '%DELETE%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as deletions_7d,
            COUNT(CASE WHEN action LIKE '%ADMIN%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as admin_actions_7d,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as total_activities_1h,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as total_activities_24h
          FROM audit_logs
        `;
        params = [];
      } else {
        // Regular users see their own security activities
        query = `
          SELECT 
            COUNT(CASE WHEN action LIKE '%LOGIN%' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as failed_logins_24h,
            COUNT(CASE WHEN action LIKE '%LOGIN%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as failed_logins_7d,
            COUNT(CASE WHEN action LIKE '%PASSWORD%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as password_changes_7d,
            COUNT(CASE WHEN action LIKE '%DELETE%' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as deletions_7d,
            0 as admin_actions_7d,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as total_activities_1h,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as total_activities_24h
          FROM audit_logs
          WHERE user_id = ?
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting security alerts: ${error.message}`);
    }
  }

  // Get recent activity
  static async getRecentActivity(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins see all recent activities
        query = `
          SELECT 
            al.action,
            al.target_type,
            al.target_name,
            al.details,
            al.created_at,
            u.name as user_name,
            r.name as user_rank
          FROM audit_logs al
          JOIN users u ON al.user_id = u.id
          LEFT JOIN ranks r ON u.rank_id = r.id
          WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
          ORDER BY al.created_at DESC
          LIMIT 10
        `;
        params = [];
      } else {
        // Regular users see their own recent activities
        query = `
          SELECT 
            al.action,
            al.target_type,
            al.target_name,
            al.details,
            al.created_at,
            u.name as user_name,
            r.name as user_rank
          FROM audit_logs al
          JOIN users u ON al.user_id = u.id
          LEFT JOIN ranks r ON u.rank_id = r.id
          WHERE al.user_id = ? AND al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
          ORDER BY al.created_at DESC
          LIMIT 10
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting recent activity: ${error.message}`);
    }
  }

  // Get conversation statistics
  static async getConversationStats(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins see all conversation stats
        query = `
          SELECT 
            COUNT(m.id) as total_messages_24h,
            COUNT(DISTINCT m.sender_id) as unique_senders_24h,
            COUNT(DISTINCT m.conversation_id) as active_conversations_24h,
            COUNT(CASE WHEN m.type = 'text' THEN 1 END) as text_messages_24h,
            COUNT(CASE WHEN m.type = 'system' THEN 1 END) as system_messages_24h
          FROM messages m
          WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `;
        params = [];
      } else {
        // Regular users see their conversation stats
        query = `
          SELECT 
            COUNT(m.id) as total_messages_24h,
            COUNT(DISTINCT m.sender_id) as unique_senders_24h,
            COUNT(DISTINCT m.conversation_id) as active_conversations_24h,
            COUNT(CASE WHEN m.type = 'text' THEN 1 END) as text_messages_24h,
            COUNT(CASE WHEN m.type = 'system' THEN 1 END) as system_messages_24h
          FROM messages m
          JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
          WHERE cp.user_id = ? AND m.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting conversation stats: ${error.message}`);
    }
  }

  // Get user statistics
  static async getUserStats(userId, userRole) {
    try {
      let query, params;

      if (userRole === 'Super_admin' || userRole === 'Admin') {
        // Admins see all user stats
        query = `
          SELECT 
            COUNT(CASE WHEN u.role_id = 1 THEN 1 END) as super_admins,
            COUNT(CASE WHEN u.role_id = 2 THEN 1 END) as admins,
            COUNT(CASE WHEN u.role_id = 3 THEN 1 END) as regular_users,
            COUNT(CASE WHEN un.name LIKE '%Army%' THEN 1 END) as army_users,
            COUNT(CASE WHEN un.name LIKE '%Navy%' THEN 1 END) as navy_users,
            COUNT(CASE WHEN un.name LIKE '%Air Force%' THEN 1 END) as air_force_users,
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN u.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d
          FROM users u
          LEFT JOIN units un ON u.unit_id = un.id
          WHERE u.is_active = 1
        `;
        params = [];
      } else {
        // Regular users see limited stats
        query = `
          SELECT 
            COUNT(CASE WHEN u.role_id = 1 THEN 1 END) as super_admins,
            COUNT(CASE WHEN u.role_id = 2 THEN 1 END) as admins,
            COUNT(CASE WHEN u.role_id = 3 THEN 1 END) as regular_users,
            COUNT(CASE WHEN un.name LIKE '%Army%' THEN 1 END) as army_users,
            COUNT(CASE WHEN un.name LIKE '%Navy%' THEN 1 END) as navy_users,
            COUNT(CASE WHEN un.name LIKE '%Air Force%' THEN 1 END) as air_force_users,
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN u.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d
          FROM users u
          LEFT JOIN units un ON u.unit_id = un.id
          WHERE u.is_active = 1 AND u.id != ?
        `;
        params = [userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  // Get detailed dashboard data for charts and analytics
  static async getDashboardAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { period = '7d' } = req.query; // 7d, 30d, 90d

      const [
        userActivityChart,
        conversationChart,
        messageChart,
        securityChart
      ] = await Promise.all([
        DashboardController.getUserActivityChart(period, userRole, userId),
        DashboardController.getConversationChart(period, userRole, userId),
        DashboardController.getMessageChart(period, userRole, userId),
        DashboardController.getSecurityChart(period, userRole, userId)
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          userActivityChart,
          conversationChart,
          messageChart,
          securityChart,
          period,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get user activity chart data
  static async getUserActivityChart(period, userRole, userId = null) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      let query, params;
      
      if (userRole === 'Super_admin' || userRole === 'Admin') {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users,
            COUNT(CASE WHEN status = 'online' THEN 1 END) as online_users
          FROM users
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [days];
      } else {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users,
            COUNT(CASE WHEN status = 'online' THEN 1 END) as online_users
          FROM users
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND id != ?
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [days, userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting user activity chart: ${error.message}`);
    }
  }

  // Get conversation chart data
  static async getConversationChart(period, userRole, userId = null) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      let query, params;
      
      if (userRole === 'Super_admin' || userRole === 'Admin') {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_conversations,
            COUNT(CASE WHEN type = 'direct' THEN 1 END) as direct_conversations,
            COUNT(CASE WHEN type = 'group' THEN 1 END) as group_conversations
          FROM conversations
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [days];
      } else {
        query = `
          SELECT 
            DATE(c.created_at) as date,
            COUNT(DISTINCT c.id) as new_conversations,
            COUNT(DISTINCT CASE WHEN c.type = 'direct' THEN c.id END) as direct_conversations,
            COUNT(DISTINCT CASE WHEN c.type = 'group' THEN c.id END) as group_conversations
          FROM conversations c
          JOIN conversation_participants cp ON c.id = cp.conversation_id
          WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND cp.user_id = ?
          GROUP BY DATE(c.created_at)
          ORDER BY date DESC
        `;
        params = [days, userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting conversation chart: ${error.message}`);
    }
  }

  // Get message chart data
  static async getMessageChart(period, userRole, userId = null) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      let query, params;
      
      if (userRole === 'Super_admin' || userRole === 'Admin') {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_messages,
            COUNT(CASE WHEN type = 'text' THEN 1 END) as text_messages,
            COUNT(CASE WHEN type = 'system' THEN 1 END) as system_messages,
            COUNT(DISTINCT sender_id) as unique_senders
          FROM messages
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [days];
      } else {
        query = `
          SELECT 
            DATE(m.created_at) as date,
            COUNT(m.id) as total_messages,
            COUNT(CASE WHEN m.type = 'text' THEN 1 END) as text_messages,
            COUNT(CASE WHEN m.type = 'system' THEN 1 END) as system_messages,
            COUNT(DISTINCT m.sender_id) as unique_senders
          FROM messages m
          JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
          WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND cp.user_id = ?
          GROUP BY DATE(m.created_at)
          ORDER BY date DESC
        `;
        params = [days, userId];
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting message chart: ${error.message}`);
    }
  }

  // Get security chart data
  static async getSecurityChart(period, userRole, userId = null) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      
      let query, params;
      
      if (userRole === 'Super_admin' || userRole === 'Admin') {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_activities,
            COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_activities,
            COUNT(CASE WHEN action LIKE '%PASSWORD%' THEN 1 END) as password_activities,
            COUNT(CASE WHEN action LIKE '%DELETE%' THEN 1 END) as delete_activities
          FROM audit_logs
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [days];
      } else {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_activities,
            COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_activities,
            COUNT(CASE WHEN action LIKE '%PASSWORD%' THEN 1 END) as password_activities,
            COUNT(CASE WHEN action LIKE '%DELETE%' THEN 1 END) as delete_activities
          FROM audit_logs
          WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        params = [userId, days];
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting security chart: ${error.message}`);
    }
  }
}

module.exports = DashboardController;
