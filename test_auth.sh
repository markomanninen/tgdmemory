#!/bin/bash

# Login Test Script for TGDMemory
# This script helps diagnose authentication issues by attempting to log in and verify authentication

# Configuration
SERVER_URL=${1:-"http://localhost:3000"}
EMAIL=${2:-"admin@example.com"}
PASSWORD=${3:-"adminpassword"}
AUTH_TOKEN_FILE=~/.cache/tgdmemory_token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}TGDMemory Authentication Test${NC}"
echo "==============================="
echo "Testing connection to: $SERVER_URL"
echo "Using email: $EMAIL"
echo

# Step 1: Test basic connectivity with ping
echo -e "${YELLOW}[1/4] Testing server connectivity...${NC}"
PING_RESPONSE=$(curl -s $SERVER_URL/api/ping)
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Cannot connect to server at $SERVER_URL${NC}"
  echo "Make sure the server is running and accessible."
  exit 1
fi
echo -e "${GREEN}Server is responding to ping.${NC}"
echo "Server response: $PING_RESPONSE"
echo

# Step 2: Attempt to login
echo -e "${YELLOW}[2/4] Attempting to login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Check if login was successful by looking for token in response
if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo -e "${GREEN}Login successful!${NC}"
  # Extract the token
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  echo "Token: ${TOKEN:0:15}..." # Only show first 15 chars
  
  # Save token to file for future use
  mkdir -p ~/.cache
  echo $TOKEN > $AUTH_TOKEN_FILE
  echo "Token saved to $AUTH_TOKEN_FILE"
else
  echo -e "${RED}Login failed!${NC}"
  echo "Server response: $LOGIN_RESPONSE"
  echo
  echo "Possible reasons for failure:"
  echo "- Incorrect email or password"
  echo "- User does not exist"
  echo "- Server authentication service is not working"
  exit 1
fi
echo

# Step 3: Verify authentication with /auth/me endpoint
echo -e "${YELLOW}[3/4] Verifying authentication with /auth/me...${NC}"
TOKEN=$(cat $AUTH_TOKEN_FILE)
ME_RESPONSE=$(curl -s $SERVER_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

if [[ $ME_RESPONSE == *"_id"* ]]; then
  echo -e "${GREEN}Authentication verified!${NC}"
  echo "User details: $ME_RESPONSE"
else
  echo -e "${RED}Authentication verification failed!${NC}"
  echo "Server response: $ME_RESPONSE"
  echo
  echo "Possible reasons for failure:"
  echo "- Token is invalid or expired"
  echo "- /auth/me endpoint is not implemented correctly"
  exit 1
fi
echo

# Step 4: Test admin access
echo -e "${YELLOW}[4/4] Testing admin access...${NC}"
ADMIN_RESPONSE=$(curl -s $SERVER_URL/api/users \
  -H "Authorization: Bearer $TOKEN")

if [[ $ADMIN_RESPONSE == *"users"* ]] || [[ $ADMIN_RESPONSE == *"_id"* ]]; then
  echo -e "${GREEN}Admin access verified!${NC}"
  echo "Response indicates successful admin access."
else
  echo -e "${RED}Admin access failed or user is not an admin!${NC}"
  echo "Response: $ADMIN_RESPONSE"
  echo
  echo "Possible reasons for failure:"
  echo "- User does not have admin role"
  echo "- Admin routes are not properly implemented"
  echo "- Authorization middleware is not working correctly"
fi
echo

echo -e "${BLUE}Authentication Test Complete${NC}"
echo "==============================="
echo -e "${GREEN}You can use the saved token for testing:${NC}"
echo "TOKEN=\$(cat $AUTH_TOKEN_FILE)"
echo "curl -H \"Authorization: Bearer \$TOKEN\" $SERVER_URL/api/users"
