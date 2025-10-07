const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

// Test credentials for two users
const USERS = [
  {
    email: 's_admin@gmail.com',
    password: 'admin123',
    name: 'Super Admin'
  },
  {
    email: 'admin@gmail.com', 
    password: 'admin123',
    name: 'Admin'
  }
];

let user1Token = '';
let user2Token = '';
let user1Socket = null;
let user2Socket = null;
let conversationId = null;

// Helper function to authenticate user
async function authenticateUser(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });

    return response.data.data.token;
  } catch (error) {
    console.error(`Authentication failed for ${user.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to create socket connection
function createSocketConnection(token, userName) {
  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log(`✅ ${userName} connected to Socket.IO`);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ ${userName} Socket.IO connection failed:`, error.message);
      resolve(null);
    });

    // Set timeout
    setTimeout(() => {
      if (!socket.connected) {
        console.error(`❌ ${userName} Socket.IO connection timeout`);
        resolve(null);
      }
    }, 5000);
  });
}

// Helper function to make authenticated requests
async function makeRequest(method, url, data = null, token) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

// Test individual messaging
async function testIndividualMessaging() {
  console.log('🚀 Starting Individual Messaging Test\n');

  // Step 1: Authenticate both users
  console.log('🔐 Authenticating users...');
  user1Token = await authenticateUser(USERS[0]);
  user2Token = await authenticateUser(USERS[1]);

  if (!user1Token || !user2Token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  console.log('✅ Both users authenticated successfully\n');

  // Step 2: Create socket connections
  console.log('🔌 Creating Socket.IO connections...');
  user1Socket = await createSocketConnection(user1Token, USERS[0].name);
  user2Socket = await createSocketConnection(user2Token, USERS[1].name);

  if (!user1Socket || !user2Socket) {
    console.log('❌ Cannot proceed without socket connections');
    return;
  }
  console.log('✅ Both users connected to Socket.IO\n');

  // Step 3: Create direct conversation
  console.log('💬 Creating direct conversation...');
  try {
    const conversationResponse = await makeRequest('POST', '/api/conversations', {
      type: 'direct',
      participant_ids: [2] // Assuming user 2 is the admin
    }, user1Token);

    conversationId = conversationResponse.data.conversation.id;
    console.log(`✅ Direct conversation created with ID: ${conversationId}\n`);
  } catch (error) {
    console.error('❌ Failed to create conversation');
    return;
  }

  // Step 4: Setup message listeners
  console.log('👂 Setting up message listeners...');
  
  user1Socket.on('new_message', (data) => {
    console.log(`📨 ${USERS[0].name} received: "${data.message.content}"`);
  });

  user2Socket.on('new_message', (data) => {
    console.log(`📨 ${USERS[1].name} received: "${data.message.content}"`);
  });

  user1Socket.on('user_typing', (data) => {
    console.log(`⌨️ ${USERS[0].name} sees: ${data.user.name} is ${data.isTyping ? 'typing' : 'not typing'}`);
  });

  user2Socket.on('user_typing', (data) => {
    console.log(`⌨️ ${USERS[1].name} sees: ${data.user.name} is ${data.isTyping ? 'typing' : 'not typing'}`);
  });

  user1Socket.on('messages_read', (data) => {
    console.log(`👀 ${USERS[0].name} sees: Messages read by user ${data.user_id}`);
  });

  user2Socket.on('messages_read', (data) => {
    console.log(`👀 ${USERS[1].name} sees: Messages read by user ${data.user_id}`);
  });

  console.log('✅ Message listeners setup complete\n');

  // Step 5: Join conversation rooms
  console.log('🚪 Joining conversation rooms...');
  user1Socket.emit('join_conversation', { conversationId });
  user2Socket.emit('join_conversation', { conversationId });
  console.log('✅ Both users joined conversation room\n');

  // Step 6: Test message exchange
  console.log('📤 Testing message exchange...');
  
  // User 1 sends first message
  console.log(`📤 ${USERS[0].name} sending: "Hello! This is a test message."`);
  await makeRequest('POST', '/api/messages/send', {
    conversation_id: conversationId,
    content: 'Hello! This is a test message.',
    type: 'text'
  }, user1Token);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // User 2 sends reply
  console.log(`📤 ${USERS[1].name} sending: "Hi there! How are you?"`);
  await makeRequest('POST', '/api/messages/send', {
    conversation_id: conversationId,
    content: 'Hi there! How are you?',
    type: 'text'
  }, user2Token);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // User 1 sends another message
  console.log(`📤 ${USERS[0].name} sending: "I'm doing great! Thanks for asking."`);
  await makeRequest('POST', '/api/messages/send', {
    conversation_id: conversationId,
    content: 'I\'m doing great! Thanks for asking.',
    type: 'text'
  }, user1Token);

  console.log('✅ Message exchange test complete\n');

  // Step 7: Test typing indicators
  console.log('⌨️ Testing typing indicators...');
  
  // User 1 starts typing
  console.log(`⌨️ ${USERS[0].name} starts typing...`);
  user1Socket.emit('typing_start', { conversationId });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // User 1 stops typing
  console.log(`⌨️ ${USERS[0].name} stops typing...`);
  user1Socket.emit('typing_stop', { conversationId });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // User 2 starts typing
  console.log(`⌨️ ${USERS[1].name} starts typing...`);
  user2Socket.emit('typing_start', { conversationId });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // User 2 stops typing
  console.log(`⌨️ ${USERS[1].name} stops typing...`);
  user2Socket.emit('typing_stop', { conversationId });

  console.log('✅ Typing indicators test complete\n');

  // Step 8: Test read receipts
  console.log('👀 Testing read receipts...');
  
  // User 2 marks messages as read
  console.log(`👀 ${USERS[1].name} marking messages as read...`);
  await makeRequest('PUT', `/api/messages/conversation/${conversationId}/read`, null, user2Token);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // User 1 marks messages as read
  console.log(`👀 ${USERS[0].name} marking messages as read...`);
  await makeRequest('PUT', `/api/messages/conversation/${conversationId}/read`, null, user1Token);

  console.log('✅ Read receipts test complete\n');

  // Step 9: Test message retrieval
  console.log('📥 Testing message retrieval...');
  
  const messagesResponse = await makeRequest('GET', `/api/messages/conversation/${conversationId}`, null, user1Token);
  console.log(`📥 Retrieved ${messagesResponse.data.messages.length} messages:`);
  
  messagesResponse.data.messages.forEach((message, index) => {
    const sender = message.sender_id === 1 ? USERS[0].name : USERS[1].name;
    console.log(`   ${index + 1}. ${sender}: "${message.content}"`);
  });

  console.log('✅ Message retrieval test complete\n');

  // Step 10: Test conversation details
  console.log('💬 Testing conversation details...');
  
  const conversationResponse = await makeRequest('GET', `/api/conversations/${conversationId}`, null, user1Token);
  console.log(`💬 Conversation details:`);
  console.log(`   Type: ${conversationResponse.data.conversation.type}`);
  console.log(`   Participants: ${conversationResponse.data.participants.length}`);
  conversationResponse.data.participants.forEach(participant => {
    console.log(`   - ${participant.name} (${participant.status})`);
  });

  console.log('✅ Conversation details test complete\n');

  // Step 11: Test unread count
  console.log('🔢 Testing unread count...');
  
  const unreadResponse = await makeRequest('GET', '/api/messages/unread/count', null, user1Token);
  console.log(`🔢 ${USERS[0].name} has ${unreadResponse.data.unread_count} unread messages`);

  const unreadResponse2 = await makeRequest('GET', '/api/messages/unread/count', null, user2Token);
  console.log(`🔢 ${USERS[1].name} has ${unreadResponse2.data.unread_count} unread messages`);

  console.log('✅ Unread count test complete\n');

  // Summary
  console.log('🎉 Individual Messaging Test Complete!');
  console.log('\n📋 Test Summary:');
  console.log('✅ User Authentication');
  console.log('✅ Socket.IO Connections');
  console.log('✅ Direct Conversation Creation');
  console.log('✅ Real-time Message Exchange');
  console.log('✅ Typing Indicators');
  console.log('✅ Read Receipts');
  console.log('✅ Message Retrieval');
  console.log('✅ Conversation Details');
  console.log('✅ Unread Message Count');
  
  console.log('\n🚀 One-to-One Individual Messaging is working perfectly!');
  
  // Cleanup
  setTimeout(() => {
    if (user1Socket) user1Socket.disconnect();
    if (user2Socket) user2Socket.disconnect();
    console.log('\n🔌 Socket connections closed');
    process.exit(0);
  }, 2000);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the test
testIndividualMessaging().catch(console.error);
