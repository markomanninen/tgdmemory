# User Management Guide

This document provides information about user management in the TGD Memory application.

## Default Admin Account

When the application is first deployed, a default admin user is created with these credentials:

- Email: `admin@tgdmemory.com`
- Password: `admin123`

**IMPORTANT**: For security reasons, change these default credentials immediately after your first login.

## MongoDB Initialization

The default admin account is created by the initialization script in `mongodb-init/init-database.js`. This script runs automatically when the MongoDB container is first created.

The script:
1. Checks if an admin user already exists
2. If no admin exists, creates one with the default credentials
3. Sets up database indexes for optimal performance

## Managing Users

### Changing Admin Password

1. Log in with the default admin credentials
2. Navigate to your profile settings
3. Use the change password function to set a new secure password

### Creating New Users

As an admin, you can create new users through the admin interface:

1. Log in with admin credentials
2. Navigate to the User Management section
3. Click "Add New User"
4. Fill in the required information
5. Assign appropriate roles

### User Roles

The application supports the following roles:
- `admin`: Full access to all features
- `editor`: Can edit content but not manage users
- `reviewer`: Can review and comment but not edit
- `user`: Standard user with limited permissions

## Troubleshooting

### Login Issues

If you cannot log in with the default credentials:

1. Check if the database has been reset
2. Verify the MongoDB container is running properly
3. Check application logs for errors

To verify the admin user exists:

```bash
docker-compose exec mongodb mongosh admin -u admin -p your_password --eval "db.getSiblingDB('tgdmemory').users.findOne({roles: {\$in: ['admin']}})"
```

### Resetting Admin Password

If you've lost access to the admin account, you can reset it by:

1. Accessing the MongoDB database directly
2. Running the following commands to update the admin password:

```javascript
// Generate a new password hash for 'newpassword'
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('newpassword', salt);
console.log(hash);

// Then in MongoDB:
db.users.updateOne(
  { email: "admin@tgdmemory.com" },
  { $set: { password: "new-password-hash-here" } }
);
```

## Security Best Practices

1. Change default credentials immediately
2. Use strong, unique passwords
3. Limit admin access to trusted individuals
4. Regularly audit user accounts
5. Monitor login attempts and suspicious activity
