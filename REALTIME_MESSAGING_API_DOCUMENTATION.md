# Real-Time Messaging API Documentation

## Overview

This document describes the real-time messaging system implemented for the CMS Backend. The system provides comprehensive messaging capabilities including direct messages, group conversations, real-time notifications, and Socket.IO integration for live communication.

## Features

- **Real-time messaging** with Socket.IO
- **Direct and group conversations**
- **Message delivery and read receipts**
- **Typing indicators**
- **User presence status**
- **Push notifications**
- **Message search and statistics**
- **File attachments support** (future enhancement)

## Architecture

### Components

1. **Message Model** (`src/models/Message.js`) - Handles message data operations
2. **Conversation Model** (`src/models/Conversation.js`) - Manages conversation data
3. **Message Controller** (`src/controllers/messageController.js`) - HTTP API endpoints
4. **Conversation Controller** (`src/controllers/conversationController.js`) - Conversation management
5. **Notification Controller** (`src/controllers/notificationController.js`) - Push notifications
6. **Socket Service** (`src/services/socketService.js`) - Real-time communication
7. **Validation Middleware** - Request validation and sanitization

### Database Schema

The messaging system uses the following tables:
- `conversations` - Stores conversation metadata
- `conversation_participants` - Maps users to conversations
- `messages` - Stores individual messages
- `notifications` - Stores push notifications

## API Endpoints

### Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Messages API

#### Send Message
```http
POST /api/messages/send
Content-Type: application/json

{
  "conversation_id": 1,
  "content": "Hello, how are you?",
  "type": "text"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 1,
    "content": "Hello, how are you?",
    "type": "text",
    "is_read": false,
    "created_at": "2024-01-01T12:00:00.000Z",
    "sender_name": "John Doe",
    "sender_avatar": "avatar.jpg",
    "sender_rank": "Captain",
    "sender_designation": "Commanding Officer"
  }
}
```

#### Get Messages
```http
GET /api/messages/conversation/{conversationId}?page=1&limit=50&before_id=100
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "has_more": true
    }
  }
}
```

#### Mark Messages as Read
```http
PUT /api/messages/conversation/{conversationId}/read
```

#### Get Unread Count
```http
GET /api/messages/unread/count
```

#### Search Messages
```http
GET /api/messages/search?q=search_term&page=1&limit=20
```

#### Update Message
```http
PUT /api/messages/{messageId}
Content-Type: application/json

{
  "content": "Updated message content"
}
```

#### Delete Message
```http
DELETE /api/messages/{messageId}
```

#### Set Typing Indicator
```http
POST /api/messages/conversation/{conversationId}/typing
Content-Type: application/json

{
  "isTyping": true
}
```

### Conversations API

#### Create Conversation
```http
POST /api/conversations
Content-Type: application/json

{
  "type": "group",
  "name": "Project Discussion",
  "participant_ids": [2, 3, 4]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Conversation created successfully",
  "data": {
    "conversation": {
      "id": 1,
      "type": "group",
      "name": "Project Discussion",
      "created_by": 1,
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "participants": [...]
  }
}
```

#### Get User Conversations
```http
GET /api/conversations
```

#### Get Conversation Details
```http
GET /api/conversations/{conversationId}
```

#### Add Participant
```http
POST /api/conversations/{conversationId}/participants
Content-Type: application/json

{
  "user_id": 5
}
```

#### Remove Participant
```http
DELETE /api/conversations/{conversationId}/participants/{userId}
```

#### Update Conversation
```http
PUT /api/conversations/{conversationId}
Content-Type: application/json

{
  "name": "Updated Group Name"
}
```

#### Delete Conversation
```http
DELETE /api/conversations/{conversationId}
```

### Notifications API

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&type=info&is_read=false
```

#### Mark Notification as Read
```http
PUT /api/notifications/{notificationId}/read
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
```

#### Delete Notification
```http
DELETE /api/notifications/{notificationId}
```

#### Get Notification Statistics
```http
GET /api/notifications/statistics
```

## Socket.IO Events

### Client to Server Events

#### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

#### Join Conversation
```javascript
socket.emit('join_conversation', {
  conversationId: 1
});
```

#### Leave Conversation
```javascript
socket.emit('leave_conversation', {
  conversationId: 1
});
```

#### Typing Start
```javascript
socket.emit('typing_start', {
  conversationId: 1
});
```

#### Typing Stop
```javascript
socket.emit('typing_stop', {
  conversationId: 1
});
```

#### Message Delivered
```javascript
socket.emit('message_delivered', {
  messageId: 1,
  conversationId: 1
});
```

#### Message Read
```javascript
socket.emit('message_read', {
  messageId: 1,
  conversationId: 1
});
```

#### Status Update
```javascript
socket.emit('status_update', {
  status: 'online' // 'online', 'offline', 'busy'
});
```

### Server to Client Events

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  console.log('Conversation:', data.conversation_id);
});
```

#### Message Updated
```javascript
socket.on('message_updated', (data) => {
  console.log('Message updated:', data.message);
});
```

#### Message Deleted
```javascript
socket.on('message_deleted', (data) => {
  console.log('Message deleted:', data.message_id);
});
```

#### Messages Read
```javascript
socket.on('messages_read', (data) => {
  console.log('Messages read by:', data.user_id);
  console.log('At:', data.read_at);
});
```

#### User Typing
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.user.name);
  console.log('Is typing:', data.isTyping);
});
```

#### User Status Changed
```javascript
socket.on('user_status_changed', (data) => {
  console.log('User status:', data.userId, data.status);
});
```

#### Conversation Events
```javascript
// Conversation created
socket.on('conversation_created', (data) => {
  console.log('New conversation:', data.conversation);
});

// Participant added
socket.on('participant_added', (data) => {
  console.log('User added:', data.user);
});

// Participant removed
socket.on('participant_removed', (data) => {
  console.log('User removed:', data.user);
});

// Conversation updated
socket.on('conversation_updated', (data) => {
  console.log('Conversation updated:', data);
});

// Conversation deleted
socket.on('conversation_deleted', (data) => {
  console.log('Conversation deleted:', data.conversation_id);
});
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window per IP
- **Scope**: All `/api/` endpoints

## Security Features

1. **JWT Authentication** - All endpoints require valid JWT tokens
2. **Input Validation** - All inputs are validated and sanitized
3. **SQL Injection Prevention** - Parameterized queries
4. **CORS Protection** - Configured CORS policies
5. **Rate Limiting** - Prevents API abuse
6. **User Authorization** - Role-based access control

## Usage Examples

### Frontend Integration

#### React Example
```javascript
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

function ChatComponent() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('jwt_token')
      }
    });

    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    newSocket.on('user_typing', (data) => {
      setIsTyping(data.isTyping);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = (conversationId, content) => {
    fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content: content
      })
    });
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

#### JavaScript Example
```javascript
// Connect to Socket.IO
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Send a message
async function sendMessage(conversationId, content) {
  try {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content: content
      })
    });
    
    const data = await response.json();
    console.log('Message sent:', data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message received:', data.message);
  // Update UI with new message
});

// Join a conversation
socket.emit('join_conversation', { conversationId: 1 });
```

## Testing

### Manual Testing

1. **Start the server**: `npm run dev`
2. **Test authentication**: Use Postman or curl with JWT token
3. **Test Socket.IO**: Use Socket.IO client or browser console
4. **Test real-time features**: Open multiple browser tabs/windows

### Test Scripts

```bash
# Test message sending
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"conversation_id": 1, "content": "Test message"}'

# Test conversation creation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type": "group", "name": "Test Group", "participant_ids": [2, 3]}'
```

## Performance Considerations

1. **Database Indexing** - Proper indexes on frequently queried columns
2. **Connection Pooling** - MySQL connection pool for database operations
3. **Socket.IO Scaling** - Redis adapter for horizontal scaling (future)
4. **Message Pagination** - Limit message history retrieval
5. **Caching** - Redis caching for frequently accessed data (future)

## Future Enhancements

1. **File Attachments** - Support for image, document, and file sharing
2. **Message Reactions** - Emoji reactions to messages
3. **Message Threading** - Reply to specific messages
4. **Voice/Video Calls** - WebRTC integration
5. **Message Encryption** - End-to-end encryption
6. **Push Notifications** - Mobile push notifications
7. **Message Scheduling** - Schedule messages for later delivery
8. **Message Templates** - Predefined message templates
9. **Message Translation** - Automatic message translation
10. **Advanced Search** - Full-text search with filters

## Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   - Check JWT token validity
   - Verify CORS configuration
   - Check network connectivity

2. **Messages Not Sending**
   - Verify user is participant in conversation
   - Check message validation rules
   - Verify authentication token

3. **Real-time Events Not Working**
   - Check Socket.IO connection status
   - Verify event names match exactly
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=socket.io:*
npm run dev
```

## Support

For technical support or questions about the messaging API, please contact the development team or create an issue in the project repository.
