// Simple test script for the chat API
// Run with: node test-client.js

const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:6000';
const API_URL = `${BASE_URL}/api`;

let user1Token, user2Token, user1Id, user2Id, chatId;

async function registerUser(name, email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    console.log(`✓ Registered user: ${name}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to register ${name}:`, error.response?.data || error.message);
    return null;
  }
}

async function createChat(token, participants) {
  try {
    const response = await axios.post(
      `${API_URL}/chat`,
      { participants, type: 'private' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Created chat');
    return response.data;
  } catch (error) {
    console.error('✗ Failed to create chat:', error.response?.data || error.message);
    return null;
  }
}

async function getMessages(token, chatId) {
  try {
    const response = await axios.get(
      `${API_URL}/chat/${chatId}/messages?page=1&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✓ Retrieved ${response.data.messages.length} messages`);
    return response.data;
  } catch (error) {
    console.error('✗ Failed to get messages:', error.response?.data || error.message);
    return null;
  }
}

function connectSocket(token, userId) {
  const socket = io(BASE_URL, {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log(`✓ User ${userId} connected to Socket.IO`);
  });

  socket.on('receive-message', (data) => {
    console.log(`✓ User ${userId} received message:`, data.message.content);
  });

  socket.on('error', (error) => {
    console.error(`✗ Socket error for user ${userId}:`, error);
  });

  socket.on('connect_error', (error) => {
    console.error(`✗ Connection error for user ${userId}:`, error.message);
  });

  return socket;
}

async function runTests() {
  console.log('\n=== Testing Car Sahajjo Chat API ===\n');

  // Step 1: Register two users
  console.log('Step 1: Registering users...');
  const timestamp = Date.now();
  const user1Data = await registerUser(
    'Alice Test',
    `alice-${timestamp}@test.com`,
    'password123'
  );
  const user2Data = await registerUser(
    'Bob Test',
    `bob-${timestamp}@test.com`,
    'password123'
  );

  if (!user1Data || !user2Data) {
    console.error('\nTest failed: Could not register users');
    process.exit(1);
  }

  user1Token = user1Data.token;
  user2Token = user2Data.token;
  user1Id = user1Data.user.id;
  user2Id = user2Data.user.id;

  console.log();

  // Step 2: Create a chat
  console.log('Step 2: Creating chat...');
  const chat = await createChat(user1Token, [user1Id, user2Id]);
  if (!chat) {
    console.error('\nTest failed: Could not create chat');
    process.exit(1);
  }
  chatId = chat._id;

  console.log();

  // Step 3: Connect both users via Socket.IO
  console.log('Step 3: Connecting users via Socket.IO...');
  const socket1 = connectSocket(user1Token, 'User1');
  const socket2 = connectSocket(user2Token, 'User2');

  // Wait for connections
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log();

  // Step 4: Join chat room
  console.log('Step 4: Joining chat room...');
  socket1.emit('join-chat', chatId);
  socket2.emit('join-chat', chatId);
  console.log('✓ Both users joined chat room');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log();

  // Step 5: Send messages
  console.log('Step 5: Sending messages...');
  socket1.emit('send-message', {
    chatId,
    content: 'Hello from User 1!',
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  socket2.emit('send-message', {
    chatId,
    content: 'Hello from User 2!',
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log();

  // Step 6: Retrieve message history
  console.log('Step 6: Retrieving message history...');
  const messages = await getMessages(user1Token, chatId);
  if (messages && messages.messages.length >= 2) {
    console.log('✓ Message persistence verified');
  } else {
    console.error('✗ Message persistence failed');
  }

  console.log();

  // Cleanup
  socket1.disconnect();
  socket2.disconnect();

  console.log('=== All tests completed successfully! ===\n');
  process.exit(0);
}

// Check if required packages are installed
try {
  require('axios');
  require('socket.io-client');
} catch (error) {
  console.error('\nError: Required packages not installed.');
  console.error('Please run: npm install axios socket.io-client\n');
  process.exit(1);
}

runTests().catch((error) => {
  console.error('\nTest failed with error:', error);
  process.exit(1);
});
