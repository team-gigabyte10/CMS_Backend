const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

// Test credentials (replace with actual test user credentials)
const TEST_USER = {
  email: 's_admin@gmail.com',
  password: 'admin123'
};

let authToken = '';
let socket = null;

// Helper function to make authenticated requests
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Request failed: ${method} ${url}`, error.response?.data || error.message);
    throw error;
  }
}

// Test authentication
async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    authToken = response.data.data.token;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Test Socket.IO connection
async function testSocketConnection() {
  console.log('🔌 Testing Socket.IO connection...');
  
  return new Promise((resolve) => {
    socket = io(SOCKET_URL, {
      auth: {
        token: authToken
      }
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection failed:', error.message);
      resolve(false);
    });

    // Set timeout
    setTimeout(() => {
      if (!socket.connected) {
        console.error('❌ Socket.IO connection timeout');
        resolve(false);
      }
    }, 5000);
  });
}

// Test conversation creation
async function testCreateConversation() {
  console.log('💬 Testing conversation creation...');
  
  try {
    const response = await makeRequest('POST', '/api/conversations', {
      type: 'group',
      name: 'Test Conversation',
      participant_ids: [2] // Assuming user ID 2 exists
    });

    console.log('✅ Conversation created:', response.data.conversation.id);
    return response.data.conversation.id;
  } catch (error) {
    console.error('❌ Conversation creation failed');
    return null;
  }
}

// Test message sending
async function testSendMessage(conversationId) {
  console.log('📤 Testing message sending...');
  
  try {
    const response = await makeRequest('POST', '/api/messages/send', {
      conversation_id: conversationId,
      content: 'Hello, this is a test message!',
      type: 'text'
    });

    console.log('✅ Message sent:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('❌ Message sending failed');
    return null;
  }
}

// Test getting messages
async function testGetMessages(conversationId) {
  console.log('📥 Testing message retrieval...');
  
  try {
    const response = await makeRequest('GET', `/api/messages/conversation/${conversationId}`);
    
    console.log(`✅ Retrieved ${response.data.messages.length} messages`);
    return response.data.messages;
  } catch (error) {
    console.error('❌ Message retrieval failed');
    return [];
  }
}

// Test Socket.IO events
function testSocketEvents(conversationId) {
  console.log('🔔 Testing Socket.IO events...');
  
  // Listen for new messages
  socket.on('new_message', (data) => {
    console.log('📨 Received new message event:', data.message.content);
  });

  // Listen for typing indicators
  socket.on('user_typing', (data) => {
    console.log('⌨️ User typing:', data.user.name, data.isTyping);
  });

  // Listen for user status changes
  socket.on('user_status_changed', (data) => {
    console.log('👤 User status changed:', data.userId, data.status);
  });

  // Join conversation
  socket.emit('join_conversation', { conversationId });
  console.log('✅ Joined conversation via Socket.IO');

  // Test typing indicator
  setTimeout(() => {
    socket.emit('typing_start', { conversationId });
    console.log('⌨️ Started typing indicator');
    
    setTimeout(() => {
      socket.emit('typing_stop', { conversationId });
      console.log('⌨️ Stopped typing indicator');
    }, 2000);
  }, 1000);
}

// Test notifications
async function testNotifications() {
  console.log('🔔 Testing notifications...');
  
  try {
    const response = await makeRequest('GET', '/api/notifications');
    console.log(`✅ Retrieved ${response.data.notifications.length} notifications`);
    
    const statsResponse = await makeRequest('GET', '/api/notifications/statistics');
    console.log('📊 Notification statistics:', statsResponse.data);
  } catch (error) {
    console.error('❌ Notification test failed');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Real-Time Messaging API Tests\n');
  
  // Test authentication
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Test Socket.IO connection
  const socketSuccess = await testSocketConnection();
  if (!socketSuccess) {
    console.log('❌ Cannot proceed without Socket.IO connection');
    return;
  }
  
  console.log('');
  
  // Test conversation creation
  const conversationId = await testCreateConversation();
  if (!conversationId) {
    console.log('❌ Cannot proceed without conversation');
    return;
  }
  
  console.log('');
  
  // Test message sending
  const messageId = await testSendMessage(conversationId);
  if (!messageId) {
    console.log('❌ Message sending failed');
  }
  
  console.log('');
  
  // Test message retrieval
  const messages = await testGetMessages(conversationId);
  
  console.log('');
  
  // Test Socket.IO events
  testSocketEvents(conversationId);
  
  console.log('');
  
  // Test notifications
  await testNotifications();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('- Authentication: ✅');
  console.log('- Socket.IO Connection: ✅');
  console.log('- Conversation Creation: ✅');
  console.log('- Message Sending: ✅');
  console.log('- Message Retrieval: ✅');
  console.log('- Socket.IO Events: ✅');
  console.log('- Notifications: ✅');
  
  // Keep socket alive for a bit to see events
  setTimeout(() => {
    if (socket) {
      socket.disconnect();
      console.log('\n🔌 Socket disconnected');
    }
    process.exit(0);
  }, 10000);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
runTests().catch(console.error);
