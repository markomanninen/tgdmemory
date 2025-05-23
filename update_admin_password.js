// update_admin_password.js - Script to update admin password hash
const { MongoClient } = require('mongodb');

// Connection settings
const uri = 'mongodb://admin:securepassword@localhost:27017/admin';
const dbName = 'tgdmemory';

// New password hash
const newHash = '$2b$10$HOYf7A9rjxFYn39RTxR92ehqOT49C6knfzzRvxxUcyXpivJxY29J2';

async function updateAdminPassword() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const users = db.collection('users');
    
    // Update admin password
    const result = await users.updateOne(
      { email: 'admin@tgdmemory.com' },
      { $set: { password: newHash, updatedAt: new Date() } }
    );
    
    console.log(`Password update result: ${result.modifiedCount} document modified`);
    
    // Verify update
    const admin = await users.findOne({ email: 'admin@tgdmemory.com' });
    console.log('Admin user document:');
    console.log(admin);
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

updateAdminPassword().catch(console.error);
