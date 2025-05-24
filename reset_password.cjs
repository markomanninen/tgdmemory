#!/usr/bin/env node

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Import User model
const User = require('./server/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetPassword() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tgdmemory');
    console.log('✅ Connected to MongoDB');

    // Get username from user input
    const username = await new Promise((resolve) => {
      rl.question('Enter username to reset password for: ', resolve);
    });

    // Get new password from user input
    const newPassword = await new Promise((resolve) => {
      rl.question('Enter new password: ', resolve);
    });

    // Find user
    console.log(`🔍 Looking for user: ${username}`);
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('Available users:');
      const allUsers = await User.find({}, 'username email roles');
      allUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.email}) - Roles: ${u.roles.join(', ')}`);
      });
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.username} (${user.email})`);
    console.log(`🎭 Current roles: ${user.roles.join(', ')}`);

    // Generate new hash using bcryptjs (same as the app uses)
    console.log('🔐 Generating new password hash...');
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    console.log(`🔑 New hash: ${hashedPassword}`);

    // Update the user's password directly in the database
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    console.log('✅ Password updated successfully!');

    // Test the new password
    console.log('🧪 Testing new password...');
    const updatedUser = await User.findById(user._id);
    const isValid = await updatedUser.comparePassword(newPassword);
    
    if (isValid) {
      console.log('✅ Password verification successful!');
      console.log('🎉 You can now login with:');
      console.log(`   Username/Email: ${user.username} or ${user.email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('❌ Password verification failed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  }
}

// Test curl command generation
function generateCurlTest(username, password) {
  console.log('\n🌐 Test with curl:');
  console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"${username}","password":"${password}"}'`);
}

// Run the script
console.log('🔧 TGD Memory - Password Reset Tool');
console.log('===================================');

resetPassword().catch(console.error);
