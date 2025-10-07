const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const { validationResult } = require('express-validator')

class MessageController {
  // Send a message
  static async sendMessage (req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { conversation_id, content, type = 'text' } = req.body
      const sender_id = req.user.id

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversation_id)
      if (!conversation) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        })
      }

      const participants = await conversation.getParticipants()
      const isParticipant = participants.some(p => p.id === sender_id)

      if (!isParticipant) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a participant in this conversation'
        })
      }

      // Create message
      const messageId = await Message.create({
        conversation_id,
        sender_id,
        content,
        type
      })

      // Get the created message with sender details
      const message = await Message.findById(messageId)

      // Emit real-time event to all participants
      const io = req.app.get('io')
      if (io) {
        participants.forEach(participant => {
          io.to(`user_${participant.id}`).emit('new_message', {
            message: message.toJSON(),
            conversation_id
          })
        })
      }

      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: message.toJSON()
      })
    } catch (error) {
      console.error('Error sending message:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to send message',
        error: error.message
      })
    }
  }

  // Get messages for a conversation
  static async getMessages (req, res) {
    try {
      const { conversationId } = req.params
      const { page = 1, limit = 50, before_id } = req.query
      const userId = req.user.id

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        })
      }

      const participants = await conversation.getParticipants()
      const isParticipant = participants.some(p => p.id === userId)

      if (!isParticipant) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a participant in this conversation'
        })
      }

      // Get messages
      const messages = await Message.findByConversationId(conversationId, {
        page: parseInt(page),
        limit: parseInt(limit),
        before_id: before_id ? parseInt(before_id) : null
      })

      res.json({
        status: 'success',
        data: {
          messages: messages.map(msg => msg.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            has_more: messages.length === parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error getting messages:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get messages',
        error: error.message
      })
    }
  }

  // Mark messages as read
  static async markAsRead (req, res) {
    try {
      const { conversationId } = req.params
      const userId = req.user.id

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        })
      }

      const participants = await conversation.getParticipants()
      const isParticipant = participants.some(p => p.id === userId)

      if (!isParticipant) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a participant in this conversation'
        })
      }

      // Mark messages as read
      await Message.markAsRead(conversationId, userId)

      // Emit read receipt to other participants
      const io = req.app.get('io')
      if (io) {
        participants.forEach(participant => {
          if (participant.id !== userId) {
            io.to(`user_${participant.id}`).emit('messages_read', {
              conversation_id: conversationId,
              user_id: userId,
              read_at: new Date().toISOString()
            })
          }
        })
      }

      res.json({
        status: 'success',
        message: 'Messages marked as read'
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark messages as read',
        error: error.message
      })
    }
  }

  // Get unread message count
  static async getUnreadCount (req, res) {
    try {
      const userId = req.user.id
      const unreadCount = await Message.getUnreadCount(userId)

      res.json({
        status: 'success',
        data: {
          unread_count: unreadCount
        }
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get unread count',
        error: error.message
      })
    }
  }

  // Get unread messages
  static async getUnreadMessages (req, res) {
    try {
      const userId = req.user.id
      const unreadMessages = await Message.getUnreadMessages(userId)

      res.json({
        status: 'success',
        data: {
          messages: unreadMessages.map(msg => msg.toJSON())
        }
      })
    } catch (error) {
      console.error('Error getting unread messages:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get unread messages',
        error: error.message
      })
    }
  }

  // Update message
  static async updateMessage (req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { messageId } = req.params
      const { content } = req.body
      const userId = req.user.id

      // Get message
      const message = await Message.findById(messageId)
      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        })
      }

      // Check if user is the sender
      if (message.sender_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only edit your own messages'
        })
      }

      // Update message
      const updated = await message.update({ content })
      if (!updated) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to update message'
        })
      }

      // Get updated message
      const updatedMessage = await Message.findById(messageId)

      // Emit update event to conversation participants
      const conversation = await Conversation.findById(message.conversation_id)
      const participants = await conversation.getParticipants()
      const io = req.app.get('io')

      if (io) {
        participants.forEach(participant => {
          io.to(`user_${participant.id}`).emit('message_updated', {
            message: updatedMessage.toJSON(),
            conversation_id: message.conversation_id
          })
        })
      }

      res.json({
        status: 'success',
        message: 'Message updated successfully',
        data: updatedMessage.toJSON()
      })
    } catch (error) {
      console.error('Error updating message:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to update message',
        error: error.message
      })
    }
  }

  // Delete message
  static async deleteMessage (req, res) {
    try {
      const { messageId } = req.params
      const userId = req.user.id

      // Get message
      const message = await Message.findById(messageId)
      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        })
      }

      // Check if user is the sender
      if (message.sender_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only delete your own messages'
        })
      }

      // Delete message
      const deleted = await message.delete()
      if (!deleted) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to delete message'
        })
      }

      // Emit delete event to conversation participants
      const conversation = await Conversation.findById(message.conversation_id)
      const participants = await conversation.getParticipants()
      const io = req.app.get('io')

      if (io) {
        participants.forEach(participant => {
          io.to(`user_${participant.id}`).emit('message_deleted', {
            message_id: messageId,
            conversation_id: message.conversation_id
          })
        })
      }

      res.json({
        status: 'success',
        message: 'Message deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete message',
        error: error.message
      })
    }
  }

  // Search messages
  static async searchMessages (req, res) {
    try {
      const { q: searchTerm } = req.query
      const { conversationId } = req.params
      const { page = 1, limit = 20 } = req.query
      const userId = req.user.id

      if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Search term is required'
        })
      }

      // If searching in specific conversation, verify user is participant
      if (conversationId) {
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
          return res.status(404).json({
            status: 'error',
            message: 'Conversation not found'
          })
        }

        const participants = await conversation.getParticipants()
        const isParticipant = participants.some(p => p.id === userId)

        if (!isParticipant) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not a participant in this conversation'
          })
        }
      }

      // Search messages
      const messages = await Message.search(searchTerm, {
        userId,
        conversationId: conversationId || null,
        page: parseInt(page),
        limit: parseInt(limit)
      })

      res.json({
        status: 'success',
        data: {
          messages: messages.map(msg => msg.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            has_more: messages.length === parseInt(limit)
          }
        }
      })
    } catch (error) {
      console.error('Error searching messages:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to search messages',
        error: error.message
      })
    }
  }

  // Get message statistics
  static async getStatistics (req, res) {
    try {
      const { startDate, endDate, conversationId } = req.query
      const userId = req.user.id

      // If getting stats for specific conversation, verify user is participant
      if (conversationId) {
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
          return res.status(404).json({
            status: 'error',
            message: 'Conversation not found'
          })
        }

        const participants = await conversation.getParticipants()
        const isParticipant = participants.some(p => p.id === userId)

        if (!isParticipant) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not a participant in this conversation'
          })
        }
      }

      // Get statistics
      const stats = await Message.getStatistics({
        startDate: startDate || null,
        endDate: endDate || null,
        conversationId: conversationId || null
      })

      res.json({
        status: 'success',
        data: stats
      })
    } catch (error) {
      console.error('Error getting message statistics:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to get message statistics',
        error: error.message
      })
    }
  }

  // Typing indicator
  static async setTyping (req, res) {
    try {
      const { conversationId } = req.params
      const { isTyping } = req.body
      const userId = req.user.id

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        })
      }

      const participants = await conversation.getParticipants()
      const isParticipant = participants.some(p => p.id === userId)

      if (!isParticipant) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a participant in this conversation'
        })
      }

      // Emit typing indicator to other participants
      const io = req.app.get('io')
      if (io) {
        participants.forEach(participant => {
          if (participant.id !== userId) {
            io.to(`user_${participant.id}`).emit('typing_indicator', {
              conversation_id: conversationId,
              user_id: userId,
              is_typing: isTyping,
              user_name: req.user.name
            })
          }
        })
      }

      res.json({
        status: 'success',
        message: 'Typing indicator updated'
      })
    } catch (error) {
      console.error('Error setting typing indicator:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to set typing indicator',
        error: error.message
      })
    }
  }
}

module.exports = MessageController
