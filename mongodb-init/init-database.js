// MongoDB initialization script for Docker
// This script creates the initial admin user and sets up the database

// Connect to the database
db = db.getSiblingDB('tgdmemory');

// Create an initial admin user (only if none exists)
const existingAdmin = db.users.findOne({ roles: { $in: ['admin'] } });

if (!existingAdmin) {
    print('Creating initial admin user...');
    
    // Create admin user with default or environment-provided credentials
    // Default password hash is for 'admin123' - CHANGE IN PRODUCTION!
    const defaultPasswordHash = '$2b$10$Xn.i0FB1YkmPN5tLnb2Yru7CtkF.zw77HbxCf3ijyGB9C189d73h.';
    
    // Use environment variables if available, otherwise use defaults
    // These would be passed in through docker-compose.yml environment section
    const adminUser = {
        username: 'admin',
        email: 'admin@tgdmemory.com',
        password: defaultPasswordHash,
        roles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    db.users.insertOne(adminUser);
    print('Admin user created with default credentials');
    print('IMPORTANT: Change the admin password after first login!');
} else {
    print('Admin user already exists, skipping creation.');
}

// Create indexes for better performance
print('Creating database indexes...');

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "roles": 1 });

// Comment indexes
db.comments.createIndex({ "pageUrl": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "status": 1 });
db.comments.createIndex({ "userGroup": 1 });
db.comments.createIndex({ "isPrivate": 1 });
db.comments.createIndex({ "createdAt": -1 });
db.comments.createIndex({ "tags": 1 });

// Compound indexes for common queries
db.comments.createIndex({ "pageUrl": 1, "status": 1, "userGroup": 1 });
db.comments.createIndex({ "userId": 1, "pageUrl": 1, "isPrivate": 1 });

print('Database indexes created successfully.');
print('Database initialization complete.');
