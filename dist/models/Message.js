const { pool } = require('../config/database');
class Message {
    constructor(data) {
        this.id = data.id;
        this.conversation_id = data.conversation_id;
        this.sender_id = data.sender_id;
        this.content = data.content;
        this.type = data.type || 'text';
        this.is_read = data.is_read || false;
        this.created_at = data.created_at;
        this.sender_name = data.sender_name;
        this.sender_avatar = data.sender_avatar;
        this.sender_rank = data.sender_rank;
        this.sender_designation = data.sender_designation;
    }
    // Create a new message
    static async create(messageData) {
        const { conversation_id, sender_id, content, type = 'text' } = messageData;
        const query = `
      INSERT INTO messages (conversation_id, sender_id, content, type) 
      VALUES (?, ?, ?, ?)
    `;
        const values = [conversation_id, sender_id, content, type];
        try {
            const [result] = await pool.execute(query, values);
            return result.insertId;
        }
        catch (error) {
            throw new Error(`Error creating message: ${error.message}`);
        }
    }
    // Find message by ID with sender details
    static async findById(id) {
        const query = `
      SELECT 
        m.*,
        u.name as sender_name,
        u.avatar as sender_avatar,
        r.name as sender_rank,
        d.name as sender_designation
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN designations d ON u.designation_id = d.id
      WHERE m.id = ?
    `;
        try {
            const [rows] = await pool.execute(query, [id]);
            return rows.length > 0 ? new Message(rows[0]) : null;
        }
        catch (error) {
            throw new Error(`Error finding message by ID: ${error.message}`);
        }
    }
    // Get messages for a conversation with pagination
    static async findByConversationId(conversationId, options = {}) {
        const { page = 1, limit = 50, before_id = null } = options;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const offset = (pageNum - 1) * limitNum;
        let query = `
      SELECT 
        m.*,
        u.name as sender_name,
        u.avatar as sender_avatar,
        u.status as sender_status,
        r.name as sender_rank,
        d.name as sender_designation
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN designations d ON u.designation_id = d.id
      WHERE m.conversation_id = ?
    `;
        const queryParams = [conversationId];
        if (before_id) {
            query += ' AND m.id < ?';
            queryParams.push(before_id);
        }
        query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(limitNum, offset);
        try {
            const [rows] = await pool.execute(query, queryParams);
            return rows.map(row => new Message(row));
        }
        catch (error) {
            throw new Error(`Error finding messages for conversation: ${error.message}`);
        }
    }
    // Get unread message count for a user
    static async getUnreadCount(userId) {
        const query = `
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = ? 
        AND m.sender_id != ?
        AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
    `;
        try {
            const [rows] = await pool.execute(query, [userId, userId]);
            return rows[0].unread_count;
        }
        catch (error) {
            throw new Error(`Error getting unread count: ${error.message}`);
        }
    }
    // Get unread messages for a user
    static async getUnreadMessages(userId) {
        const query = `
      SELECT 
        m.*,
        c.id as conversation_id,
        c.type as conversation_type,
        c.name as conversation_name,
        u.name as sender_name,
        u.avatar as sender_avatar,
        r.name as sender_rank,
        d.name as sender_designation
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN designations d ON u.designation_id = d.id
      WHERE cp.user_id = ? 
        AND m.sender_id != ?
        AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
      ORDER BY m.created_at ASC
    `;
        try {
            const [rows] = await pool.execute(query, [userId, userId]);
            return rows.map(row => new Message(row));
        }
        catch (error) {
            throw new Error(`Error getting unread messages: ${error.message}`);
        }
    }
    // Mark messages as read
    static async markAsRead(conversationId, userId) {
        const query = `
      UPDATE conversation_participants 
      SET last_read_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = ? AND user_id = ?
    `;
        try {
            const [result] = await pool.execute(query, [conversationId, userId]);
            return result.affectedRows > 0;
        }
        catch (error) {
            throw new Error(`Error marking messages as read: ${error.message}`);
        }
    }
    // Mark specific message as read
    static async markMessageAsRead(messageId, userId) {
        const query = `
      UPDATE messages 
      SET is_read = 1 
      WHERE id = ? AND sender_id != ?
    `;
        try {
            const [result] = await pool.execute(query, [messageId, userId]);
            return result.affectedRows > 0;
        }
        catch (error) {
            throw new Error(`Error marking message as read: ${error.message}`);
        }
    }
    // Update message
    async update(updateData) {
        const allowedFields = ['content'];
        const fields = [];
        const values = [];
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(this.id);
        const query = `UPDATE messages SET ${fields.join(', ')} WHERE id = ?`;
        try {
            const [result] = await pool.execute(query, values);
            if (result.affectedRows > 0) {
                Object.assign(this, updateData);
                return true;
            }
            return false;
        }
        catch (error) {
            throw new Error(`Error updating message: ${error.message}`);
        }
    }
    // Delete message
    async delete() {
        const query = 'DELETE FROM messages WHERE id = ?';
        try {
            const [result] = await pool.execute(query, [this.id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            throw new Error(`Error deleting message: ${error.message}`);
        }
    }
    // Get message statistics
    static async getStatistics(options = {}) {
        const { startDate = null, endDate = null, conversationId = null } = options;
        let query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_messages,
        COUNT(DISTINCT sender_id) as unique_senders,
        COUNT(DISTINCT conversation_id) as active_conversations
      FROM messages
    `;
        const queryParams = [];
        const whereClauses = [];
        if (startDate) {
            whereClauses.push('created_at >= ?');
            queryParams.push(startDate);
        }
        if (endDate) {
            whereClauses.push('created_at <= ?');
            queryParams.push(endDate);
        }
        if (conversationId) {
            whereClauses.push('conversation_id = ?');
            queryParams.push(conversationId);
        }
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }
        try {
            const [rows] = await pool.execute(query, queryParams);
            return rows[0];
        }
        catch (error) {
            throw new Error(`Error getting message statistics: ${error.message}`);
        }
    }
    // Search messages
    static async search(searchTerm, options = {}) {
        const { userId = null, conversationId = null, page = 1, limit = 20 } = options;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;
        let query = `
      SELECT 
        m.*,
        u.name as sender_name,
        u.avatar as sender_avatar,
        r.name as sender_rank,
        d.name as sender_designation,
        c.type as conversation_type,
        c.name as conversation_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN ranks r ON u.rank_id = r.id
      LEFT JOIN designations d ON u.designation_id = d.id
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.content LIKE ?
    `;
        const queryParams = [`%${searchTerm}%`];
        if (userId) {
            query += ' AND EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = m.conversation_id AND cp.user_id = ?)';
            queryParams.push(userId);
        }
        if (conversationId) {
            query += ' AND m.conversation_id = ?';
            queryParams.push(conversationId);
        }
        query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(limitNum, offset);
        try {
            const [rows] = await pool.execute(query, queryParams);
            return rows.map(row => new Message(row));
        }
        catch (error) {
            throw new Error(`Error searching messages: ${error.message}`);
        }
    }
    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            conversation_id: this.conversation_id,
            sender_id: this.sender_id,
            content: this.content,
            type: this.type,
            is_read: this.is_read,
            created_at: this.created_at,
            sender_name: this.sender_name,
            sender_avatar: this.sender_avatar,
            sender_rank: this.sender_rank,
            sender_designation: this.sender_designation
        };
    }
}
module.exports = Message;
//# sourceMappingURL=Message.js.map