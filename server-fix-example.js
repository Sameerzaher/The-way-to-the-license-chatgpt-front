const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to users.json file
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper function to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write users to file
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// USER REGISTRATION ENDPOINT - WITH COURSE SUPPORT
app.post('/user/register', async (req, res) => {
  try {
    const { name, email, course } = req.body;

    console.log('📝 Registration request received:');
    console.log('  Name:', name);
    console.log('  Email:', email);
    console.log('  Course:', course); // 🔍 This should show the course

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Read existing users
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user with course field
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      course: course || 'theory', // 🎯 SAVE COURSE WITH DEFAULT
      createdAt: new Date().toISOString()
    };

    console.log('💾 Saving user to file:', newUser);

    // Add to users array
    users.push(newUser);

    // Write back to file
    await writeUsers(users);

    console.log('✅ User saved successfully');

    // Return user object INCLUDING course field
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        course: newUser.course // 🔑 IMPORTANT: Return course in response
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// USER LOGIN ENDPOINT
app.post('/user/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Read users
    const users = await readUsers();

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🔍 User found for login:', user);

    // Return user object INCLUDING course field
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        course: user.course || 'theory' // 🔑 Include course in login response too
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// CHAT ENDPOINT (example)
app.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Read users to get user info including course
    const users = await readUsers();
    const user = users.find(u => u.id === userId);

    console.log('💬 Chat request from user:', user);
    console.log('  User course:', user?.course);
    console.log('  Message:', message);

    // Here you can use the user's course to customize the chat response
    const courseContext = user?.course === 'psychology' 
      ? 'psychology driving course' 
      : 'theory driving course';

    // Mock response (replace with your actual ChatGPT integration)
    const response = `This is a response for ${courseContext}. Your message was: ${message}`;

    res.json({
      success: true,
      response: response,
      userCourse: user?.course // Include course info in chat response
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ error: 'Server error during chat' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Users file: ${USERS_FILE}`);
});

module.exports = app; 