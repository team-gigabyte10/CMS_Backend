# One-to-One Individual Messaging Guide

## Overview

The real-time messaging system supports one-to-one individual messaging between users. This guide focuses specifically on how to use the individual messaging features.

## How One-to-One Messaging Works

### 1. Creating Direct Conversations

When you create a conversation with `type: "direct"`, the system automatically creates a one-to-one conversation between two users.

```javascript
// Create a direct conversation with another user
const createDirectConversation = async (otherUserId) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'direct',
      participant_ids: [otherUserId] // Only one other user for direct messaging
    })
  });
  
  return response.json();
};
```

### 2. Finding Existing Direct Conversations

The system automatically prevents duplicate direct conversations between the same two users. If a direct conversation already exists, it returns the existing one.

### 3. Sending Messages

Once you have a conversation ID, you can send messages:

```javascript
const sendMessage = async (conversationId, message) => {
  const response = await fetch('/api/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      content: message,
      type: 'text'
    })
  });
  
  return response.json();
};
```

## Complete One-to-One Messaging Example

Here's a complete example of how to implement one-to-one messaging in your frontend:

### HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>Individual Messaging</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <div id="app">
        <div id="user-list">
            <h3>Select a user to message:</h3>
            <div id="users"></div>
        </div>
        
        <div id="chat-container" style="display: none;">
            <div id="chat-header">
                <h3>Chat with <span id="chat-user-name"></span></h3>
                <button id="back-btn">Back to Users</button>
            </div>
            
            <div id="messages"></div>
            
            <div id="message-input">
                <input type="text" id="message-text" placeholder="Type your message...">
                <button id="send-btn">Send</button>
            </div>
            
            <div id="typing-indicator" style="display: none;">
                <span id="typing-user"></span> is typing...
            </div>
        </div>
    </div>
</body>
</html>
```

### JavaScript Implementation
```javascript
class IndividualMessaging {
    constructor() {
        this.socket = null;
        this.currentConversationId = null;
        this.currentUserId = null;
        this.otherUserId = null;
        this.token = localStorage.getItem('jwt_token');
        
        this.initializeSocket();
        this.loadUsers();
        this.setupEventListeners();
    }

    // Initialize Socket.IO connection
    initializeSocket() {
        this.socket = io('http://localhost:3000', {
            auth: {
                token: this.token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to messaging server');
        });

        this.socket.on('new_message', (data) => {
            this.displayMessage(data.message);
        });

        this.socket.on('user_typing', (data) => {
            this.showTypingIndicator(data.user.name, data.isTyping);
        });

        this.socket.on('messages_read', (data) => {
            this.markMessagesAsRead();
        });
    }

    // Load available users
    async loadUsers() {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            this.displayUsers(data.data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    // Display users list
    displayUsers(users) {
        const usersContainer = document.getElementById('users');
        usersContainer.innerHTML = '';

        users.forEach(user => {
            if (user.id !== this.currentUserId) {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                userDiv.innerHTML = `
                    <div class="user-info">
                        <strong>${user.name}</strong>
                        <span class="user-status ${user.status}">${user.status}</span>
                    </div>
                    <button onclick="messaging.startChat(${user.id}, '${user.name}')">
                        Start Chat
                    </button>
                `;
                usersContainer.appendChild(userDiv);
            }
        });
    }

    // Start a chat with a specific user
    async startChat(userId, userName) {
        try {
            // Create or get direct conversation
            const conversation = await this.createDirectConversation(userId);
            
            this.currentConversationId = conversation.data.conversation.id;
            this.otherUserId = userId;
            
            // Show chat interface
            document.getElementById('user-list').style.display = 'none';
            document.getElementById('chat-container').style.display = 'block';
            document.getElementById('chat-user-name').textContent = userName;
            
            // Join conversation room
            this.socket.emit('join_conversation', {
                conversationId: this.currentConversationId
            });
            
            // Load existing messages
            this.loadMessages();
            
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    }

    // Create direct conversation
    async createDirectConversation(userId) {
        const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'direct',
                participant_ids: [userId]
            })
        });
        
        return response.json();
    }

    // Load messages for current conversation
    async loadMessages() {
        try {
            const response = await fetch(`/api/messages/conversation/${this.currentConversationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            this.displayMessages(data.data.messages.reverse()); // Show oldest first
            
            // Mark messages as read
            this.markMessagesAsRead();
            
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Display messages
    displayMessages(messages) {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender_id === this.currentUserId ? 'own' : 'other'}`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${message.content}</div>
                    <div class="message-time">${new Date(message.created_at).toLocaleTimeString()}</div>
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Display a single message
    displayMessage(message) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender_id === this.currentUserId ? 'own' : 'other'}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message.content}</div>
                <div class="message-time">${new Date(message.created_at).toLocaleTimeString()}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send a message
    async sendMessage() {
        const messageInput = document.getElementById('message-text');
        const message = messageInput.value.trim();
        
        if (!message) return;

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation_id: this.currentConversationId,
                    content: message,
                    type: 'text'
                })
            });

            if (response.ok) {
                messageInput.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    // Mark messages as read
    async markMessagesAsRead() {
        try {
            await fetch(`/api/messages/conversation/${this.currentConversationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    // Show typing indicator
    showTypingIndicator(userName, isTyping) {
        const indicator = document.getElementById('typing-indicator');
        const typingUser = document.getElementById('typing-user');
        
        if (isTyping) {
            typingUser.textContent = userName;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    // Handle typing events
    handleTyping() {
        const messageInput = document.getElementById('message-text');
        let typingTimeout;

        messageInput.addEventListener('input', () => {
            // Start typing
            this.socket.emit('typing_start', {
                conversationId: this.currentConversationId
            });

            // Clear previous timeout
            clearTimeout(typingTimeout);

            // Stop typing after 2 seconds of inactivity
            typingTimeout = setTimeout(() => {
                this.socket.emit('typing_stop', {
                    conversationId: this.currentConversationId
                });
            }, 2000);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Send message on button click
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        document.getElementById('message-text').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.goBackToUsers();
        });

        // Typing indicator
        this.handleTyping();
    }

    // Go back to users list
    goBackToUsers() {
        // Leave conversation room
        if (this.currentConversationId) {
            this.socket.emit('leave_conversation', {
                conversationId: this.currentConversationId
            });
        }

        // Reset state
        this.currentConversationId = null;
        this.otherUserId = null;

        // Show users list
        document.getElementById('user-list').style.display = 'block';
        document.getElementById('chat-container').style.display = 'none';
    }
}

// Initialize the messaging system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.messaging = new IndividualMessaging();
});
```

### CSS Styling
```css
<style>
.user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #ddd;
    margin: 5px 0;
    border-radius: 5px;
}

.user-status {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    color: white;
}

.user-status.online { background-color: #4CAF50; }
.user-status.offline { background-color: #f44336; }
.user-status.busy { background-color: #ff9800; }

#chat-container {
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #ddd;
    border-radius: 10px;
    overflow: hidden;
}

#chat-header {
    background-color: #f5f5f5;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#messages {
    height: 400px;
    overflow-y: auto;
    padding: 15px;
    background-color: #fafafa;
}

.message {
    margin: 10px 0;
    display: flex;
}

.message.own {
    justify-content: flex-end;
}

.message.other {
    justify-content: flex-start;
}

.message-content {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 18px;
}

.message.own .message-content {
    background-color: #007bff;
    color: white;
}

.message.other .message-content {
    background-color: #e9ecef;
    color: black;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 5px;
}

#message-input {
    display: flex;
    padding: 15px;
    background-color: white;
    border-top: 1px solid #ddd;
}

#message-text {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
}

#send-btn {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

#typing-indicator {
    padding: 5px 15px;
    font-style: italic;
    color: #666;
    background-color: #f0f0f0;
}
</style>
```

## API Endpoints for Individual Messaging

### 1. Create Direct Conversation
```http
POST /api/conversations
{
  "type": "direct",
  "participant_ids": [other_user_id]
}
```

### 2. Get User's Conversations
```http
GET /api/conversations
```

### 3. Send Message
```http
POST /api/messages/send
{
  "conversation_id": conversation_id,
  "content": "Your message",
  "type": "text"
}
```

### 4. Get Messages
```http
GET /api/messages/conversation/{conversationId}?page=1&limit=50
```

### 5. Mark as Read
```http
PUT /api/messages/conversation/{conversationId}/read
```

## Socket.IO Events for Individual Messaging

### Client Events
```javascript
// Join conversation
socket.emit('join_conversation', { conversationId: 1 });

// Start typing
socket.emit('typing_start', { conversationId: 1 });

// Stop typing
socket.emit('typing_stop', { conversationId: 1 });
```

### Server Events
```javascript
// New message received
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});

// User typing
socket.on('user_typing', (data) => {
  console.log('User typing:', data.user.name, data.isTyping);
});

// Messages read
socket.on('messages_read', (data) => {
  console.log('Messages read by:', data.user_id);
});
```

## Key Features of Individual Messaging

1. **Automatic Conversation Creation** - Direct conversations are created automatically between two users
2. **No Duplicates** - The system prevents duplicate direct conversations between the same users
3. **Real-time Updates** - Messages appear instantly for both users
4. **Typing Indicators** - See when the other person is typing
5. **Read Receipts** - Know when your messages have been read
6. **Message History** - All previous messages are preserved
7. **User Status** - See if the other person is online, offline, or busy

This implementation provides a complete one-to-one messaging system that's perfect for individual conversations between users! 🚀
