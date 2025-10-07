const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config/config')

class SocketService {
  constructor (io) {
    this.io = io
    this.connectedUsers = new Map() // Map of socketId -> user info
    this.userSockets = new Map() // Map of userId -> Set of socketIds
    this.setupMiddleware()
    this.setupEventHandlers()
  }

  // Setup Socket.IO middleware for authentication
  setupMiddleware () {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret)

        // Get user from database
        const user = await User.findById(decoded.id)
        if (!user || !user.is_active) {
          return next(new Error('User not found or inactive'))
        }

        // Attach user info to socket
        socket.userId = user.id
        socket.user = user

        next()
      } catch (error) {
        next(new Error('Invalid authentication token'))
      }
    })
  }

  // Setup event handlers
  setupEventHandlers () {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} (ID: ${socket.userId}) connected with socket ${socket.id}`)

      // Store user connection
      this.connectedUsers.set(socket.id, {
        userId: socket.userId,
        user: socket.user,
        connectedAt: new Date()
      })

      // Add socket to user's socket set
      if (!this.userSockets.has(socket.userId)) {
        this.userSockets.set(socket.userId, new Set())
      }
      this.userSockets.get(socket.userId).add(socket.id)

      // Join user to their personal room
      socket.join(`user_${socket.userId}`)

      // Update user status to online
      this.updateUserStatus(socket.userId, 'online')

      // Emit user online status to all connected users
      this.broadcastUserStatus(socket.userId, 'online')

      // Handle joining conversation rooms
      socket.on('join_conversation', (data) => {
        this.handleJoinConversation(socket, data)
      })

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (data) => {
        this.handleLeaveConversation(socket, data)
      })

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data)
      })

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data)
      })

      // Handle message delivery confirmation
      socket.on('message_delivered', (data) => {
        this.handleMessageDelivered(socket, data)
      })

      // Handle message read confirmation
      socket.on('message_read', (data) => {
        this.handleMessageRead(socket, data)
      })

      // Handle user status updates
      socket.on('status_update', (data) => {
        this.handleStatusUpdate(socket, data)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error)
      })
    })
  }

  // Handle joining a conversation room
  async handleJoinConversation (socket, data) {
    try {
      const { conversationId } = data

      if (!conversationId) {
        socket.emit('error', { message: 'Conversation ID is required' })
        return
      }

      // Verify user is participant in conversation
      const Conversation = require('../models/Conversation')
      const conversation = await Conversation.findById(conversationId)

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' })
        return
      }

      const participants = await conversation.getParticipants()
      const isParticipant = participants.some(p => p.id === socket.userId)

      if (!isParticipant) {
        socket.emit('error', { message: 'You are not a participant in this conversation' })
        return
      }

      // Join conversation room
      socket.join(`conversation_${conversationId}`)

      // Notify other participants that user joined
      socket.to(`conversation_${conversationId}`).emit('user_joined', {
        conversationId,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      })

      socket.emit('joined_conversation', { conversationId })
    } catch (error) {
      console.error('Error joining conversation:', error)
      socket.emit('error', { message: 'Failed to join conversation' })
    }
  }

  // Handle leaving a conversation room
  handleLeaveConversation (socket, data) {
    const { conversationId } = data

    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID is required' })
      return
    }

    socket.leave(`conversation_${conversationId}`)

    // Notify other participants that user left
    socket.to(`conversation_${conversationId}`).emit('user_left', {
      conversationId,
      user: {
        id: socket.userId,
        name: socket.user.name
      }
    })

    socket.emit('left_conversation', { conversationId })
  }

  // Handle typing start
  handleTypingStart (socket, data) {
    const { conversationId } = data

    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID is required' })
      return
    }

    // Emit typing indicator to other participants
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      user: {
        id: socket.userId,
        name: socket.user.name
      },
      isTyping: true
    })
  }

  // Handle typing stop
  handleTypingStop (socket, data) {
    const { conversationId } = data

    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID is required' })
      return
    }

    // Emit typing stop indicator to other participants
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      user: {
        id: socket.userId,
        name: socket.user.name
      },
      isTyping: false
    })
  }

  // Handle message delivered confirmation
  handleMessageDelivered (socket, data) {
    const { messageId, conversationId } = data

    if (!messageId || !conversationId) {
      socket.emit('error', { message: 'Message ID and Conversation ID are required' })
      return
    }

    // Emit delivery confirmation to sender
    socket.to(`conversation_${conversationId}`).emit('message_delivered', {
      messageId,
      conversationId,
      deliveredTo: socket.userId,
      deliveredAt: new Date().toISOString()
    })
  }

  // Handle message read confirmation
  handleMessageRead (socket, data) {
    const { messageId, conversationId } = data

    if (!messageId || !conversationId) {
      socket.emit('error', { message: 'Message ID and Conversation ID are required' })
      return
    }

    // Emit read confirmation to sender
    socket.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      conversationId,
      readBy: socket.userId,
      readAt: new Date().toISOString()
    })
  }

  // Handle user status update
  handleStatusUpdate (socket, data) {
    const { status } = data

    if (!['online', 'offline', 'busy'].includes(status)) {
      socket.emit('error', { message: 'Invalid status. Must be online, offline, or busy' })
      return
    }

    this.updateUserStatus(socket.userId, status)
    this.broadcastUserStatus(socket.userId, status)

    socket.emit('status_updated', { status })
  }

  // Handle disconnect
  handleDisconnect (socket) {
    console.log(`User ${socket.user.name} (ID: ${socket.userId}) disconnected`)

    // Remove from connected users
    this.connectedUsers.delete(socket.id)

    // Remove socket from user's socket set
    if (this.userSockets.has(socket.userId)) {
      this.userSockets.get(socket.userId).delete(socket.id)

      // If no more sockets for this user, set status to offline
      if (this.userSockets.get(socket.userId).size === 0) {
        this.userSockets.delete(socket.userId)
        this.updateUserStatus(socket.userId, 'offline')
        this.broadcastUserStatus(socket.userId, 'offline')
      }
    }
  }

  // Update user status in database
  async updateUserStatus (userId, status) {
    try {
      const user = await User.findById(userId)
      if (user) {
        await user.update({ status })
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Broadcast user status to all connected users
  broadcastUserStatus (userId, status) {
    this.io.emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date().toISOString()
    })
  }

  // Send message to specific user
  sendToUser (userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data)
  }

  // Send message to conversation
  sendToConversation (conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data)
  }

  // Broadcast to all users
  broadcast (event, data) {
    this.io.emit(event, data)
  }

  // Get connected users count
  getConnectedUsersCount () {
    return this.connectedUsers.size
  }

  // Get online users
  getOnlineUsers () {
    const onlineUsers = []
    for (const [, userInfo] of this.connectedUsers) {
      onlineUsers.push({
        userId: userInfo.userId,
        name: userInfo.user.name,
        avatar: userInfo.user.avatar,
        status: userInfo.user.status,
        connectedAt: userInfo.connectedAt
      })
    }
    return onlineUsers
  }

  // Check if user is online
  isUserOnline (userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0
  }
}

module.exports = SocketService
