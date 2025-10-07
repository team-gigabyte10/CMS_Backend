const { pool } = require('../config/database')

class Conversation {
  constructor (data) {
    this.id = data.id
    this.type = data.type
    this.name = data.name
    this.created_by = data.created_by
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  // Create a new conversation
  static async create (conversationData) {
    const { type, name, created_by } = conversationData

    const query = 'INSERT INTO conversations (type, name, created_by) VALUES (?, ?, ?)'
    const values = [type, name, created_by]

    try {
      const [result] = await pool.execute(query, values)
      return result.insertId
    } catch (error) {
      throw new Error(`Error creating conversation: ${error.message}`)
    }
  }

  // Find conversation by ID
  static async findById (id) {
    const query = 'SELECT * FROM conversations WHERE id = ?'
    try {
      const [rows] = await pool.execute(query, [id])
      return rows.length > 0 ? new Conversation(rows[0]) : null
    } catch (error) {
      throw new Error(`Error finding conversation by ID: ${error.message}`)
    }
  }

  // Get conversations for a user
  static async findByUserId (userId) {
    const query = `
      SELECT DISTINCT c.*, 
             COUNT(DISTINCT cp.user_id) as participant_count,
             COUNT(m.id) as message_count,
             MAX(m.created_at) as last_message_at
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE cp.user_id = ?
      GROUP BY c.id, c.type, c.name, c.created_by, c.created_at, c.updated_at
      ORDER BY last_message_at DESC, c.created_at DESC
    `

    try {
      const [rows] = await pool.execute(query, [userId])
      return rows.map(row => ({
        ...new Conversation(row),
        participant_count: row.participant_count,
        message_count: row.message_count,
        last_message_at: row.last_message_at
      }))
    } catch (error) {
      throw new Error(`Error finding conversations for user: ${error.message}`)
    }
  }

  // Create direct conversation between two users
  static async createDirectConversation (user1Id, user2Id) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Check if conversation already exists
      const checkQuery = `
        SELECT c.id FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.type = 'direct'
          AND ((cp1.user_id = ? AND cp2.user_id = ?)
            OR (cp1.user_id = ? AND cp2.user_id = ?))
      `

      const [existing] = await connection.execute(checkQuery, [user1Id, user2Id, user2Id, user1Id])

      if (existing.length > 0) {
        return existing[0].id
      }

      // Create new conversation
      const createQuery = 'INSERT INTO conversations (type, created_by) VALUES (?, ?)'
      const [result] = await connection.execute(createQuery, ['direct', user1Id])
      const conversationId = result.insertId

      // Add participants
      const participantQuery = 'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)'
      await connection.execute(participantQuery, [conversationId, user1Id, conversationId, user2Id])

      await connection.commit()
      return conversationId
    } catch (error) {
      await connection.rollback()
      throw new Error(`Error creating direct conversation: ${error.message}`)
    } finally {
      connection.release()
    }
  }

  // Create group conversation
  static async createGroupConversation (name, createdBy, participantIds) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Create conversation
      const createQuery = 'INSERT INTO conversations (type, name, created_by) VALUES (?, ?, ?)'
      const [result] = await connection.execute(createQuery, ['group', name, createdBy])
      const conversationId = result.insertId

      // Add participants
      if (participantIds && participantIds.length > 0) {
        const participantQuery = 'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ?'
        const participantValues = participantIds.map(userId => [conversationId, userId])
        await connection.execute(participantQuery, [participantValues])
      }

      await connection.commit()
      return conversationId
    } catch (error) {
      await connection.rollback()
      throw new Error(`Error creating group conversation: ${error.message}`)
    } finally {
      connection.release()
    }
  }

  // Add participant to conversation
  async addParticipant (userId) {
    const query = 'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)'
    try {
      const [result] = await pool.execute(query, [this.id, userId])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error adding participant: ${error.message}`)
    }
  }

  // Remove participant from conversation
  async removeParticipant (userId) {
    const query = 'DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?'
    try {
      const [result] = await pool.execute(query, [this.id, userId])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error removing participant: ${error.message}`)
    }
  }

  // Get conversation participants
  async getParticipants () {
    const query = `
      SELECT u.id, u.name, u.rank_id, u.service_no, u.avatar, u.status, u.last_seen,
             cp.joined_at, cp.last_read_at
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ? AND u.is_active = 1
      ORDER BY cp.joined_at
    `

    try {
      const [rows] = await pool.execute(query, [this.id])
      return rows
    } catch (error) {
      throw new Error(`Error getting participants: ${error.message}`)
    }
  }

  // Update conversation
  async update (updateData) {
    const allowedFields = ['name']
    const fields = []
    const values = []

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`)
        values.push(updateData[key])
      }
    })

    if (fields.length === 0) {
      throw new Error('No valid fields to update')
    }

    values.push(this.id)

    const query = `UPDATE conversations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    try {
      const [result] = await pool.execute(query, values)
      if (result.affectedRows > 0) {
        Object.assign(this, updateData)
        return true
      }
      return false
    } catch (error) {
      throw new Error(`Error updating conversation: ${error.message}`)
    }
  }

  // Delete conversation
  async delete () {
    const query = 'DELETE FROM conversations WHERE id = ?'
    try {
      const [result] = await pool.execute(query, [this.id])
      return result.affectedRows > 0
    } catch (error) {
      throw new Error(`Error deleting conversation: ${error.message}`)
    }
  }

  // Get conversation summary
  static async getSummary () {
    const query = `
      SELECT 
        c.id,
        c.type,
        c.name,
        COUNT(DISTINCT cp.user_id) as participant_count,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at,
        c.created_at,
        c.updated_at
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY c.id, c.type, c.name, c.created_at, c.updated_at
      ORDER BY last_message_at DESC, c.created_at DESC
    `

    try {
      const [rows] = await pool.execute(query)
      return rows
    } catch (error) {
      throw new Error(`Error getting conversation summary: ${error.message}`)
    }
  }
}

module.exports = Conversation
