# Admin Dashboard Troubleshooting Guide

If you're experiencing a white screen or issues when accessing the admin dashboard, follow these steps to diagnose and resolve the problem.

## Quick Check

1. **Verify the server is running**
   ```bash
   # From the project root
   cd server
   npm run dev
   ```

2. **Test authentication**
   ```bash
   # From the project root
   ./test_auth.sh
   ```

3. **Clear browser cache and cookies**
   - Open your browser's settings
   - Clear cache and cookies for the site
   - Try logging in again

## Step-by-Step Troubleshooting

### 1. Check Server Connection

Make sure the backend server is running properly:

```bash
# Test the server ping endpoint
curl http://localhost:3000/api/ping
```

Expected response:
```json
{"status":"ok","message":"Server is running","timestamp":"2023-05-23T12:34:56.789Z","environment":"development"}
```

### 2. Verify Authentication

The most common cause of the white screen is authentication problems:

```bash
# Test login (adjust credentials as needed)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"your_password"}'
```

### 3. Check Rate Limiting 

If you're experiencing "Too many requests" errors, you may have hit rate limits:

```bash
# Test if rate limiting is in effect
curl -I http://localhost:3000/api/users
```

Look for headers like `X-RateLimit-Remaining` or a 429 status code which indicates rate limiting.

To test rate limiting functionality:
```bash
# Run the rate limiting test script
./test_rate_limiting.sh
```

Rate limiting configuration can be adjusted in `server/server.js` for different environments.

If successful, you'll receive a token. Save it:

```bash
# Save token to variable
TOKEN="your_token_here"

# Test if you're authenticated correctly
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Check Admin Access

Verify you have admin privileges:

```bash
# Test admin endpoint access
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

If you see an access denied message, your user doesn't have the admin role.

### 4. Check for Console Errors

1. Open your browser's developer tools (F12 or right-click → Inspect)
2. Go to the Console tab
3. Look for error messages when loading the admin dashboard
4. Check the Network tab for failed API requests

### 5. Debug Mode

Visit the admin debug page at `/admin/debug` which will show detailed diagnostic information about:
- Authentication status
- Token information
- API connectivity tests

### 6. Common Issues and Solutions

#### "Cannot authenticate" or "Invalid token"
- Your login session may have expired
- The server could be restarted and using a different JWT secret
- Solution: Log out and log back in

#### "Access denied" messages
- Your user account may not have the admin role
- Solution: Check user roles in the database

#### API errors
- The server might be misconfigured
- MongoDB might be disconnected
- Solution: Check server logs

### 7. Get More Help

If you're still experiencing issues:
1. Check the server logs for errors
2. Run the project in development mode to see more detailed error messages
3. Contact the developer with details of your issue

## Login Problems

If you cannot log in to the admin dashboard:

1. **Verify default credentials**
   - Default admin email: `admin@tgdmemory.com`
   - Default password: `admin123`
   - These are created when the MongoDB container is first initialized
   - See [User Management Guide](./docs/USER_MANAGEMENT.md) for more details

2. **Check MongoDB connection**
   Verify the database is running and the admin user exists:
   ```bash
   # Check if MongoDB container is running
   docker-compose ps mongodb
   
   # Check if admin user exists in the database
   docker-compose exec mongodb mongosh admin -u admin -p your_password --eval "db.getSiblingDB('tgdmemory').users.findOne({roles: {\\$in: ['admin']}})"
   ```

3. **Reset admin password if needed**
   If you've forgotten the admin password, follow the password reset procedure in the [User Management Guide](./docs/USER_MANAGEMENT.md).

## Advanced Troubleshooting

For developers:

```bash
# From the project root directory
node server/setup.sh  # Reset and setup the backend
```

Database check:
```bash
# Connect to MongoDB and check user roles
mongo tgdmemory --eval 'db.users.find({email:"your_email@example.com"}).pretty()'
```

Browser localStorage check (in browser console):
```javascript
// Check stored token
console.log(localStorage.getItem('token'));
```
