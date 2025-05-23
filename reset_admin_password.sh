#!/bin/bash
# Script to reset the admin password for TGD Memory application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}TGD Memory Admin Password Reset Tool${NC}"
echo "This tool will reset the password for the admin user."
echo -e "${RED}WARNING: This should only be used if you have lost access to the admin account.${NC}"
echo

# Ask for confirmation
read -p "Are you sure you want to reset the admin password? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Password reset cancelled."
    exit 1
fi

# Ask for new password
echo "Please enter a new secure password for the admin account."
read -s -p "New password: " NEW_PASSWORD
echo
read -s -p "Confirm new password: " CONFIRM_PASSWORD
echo

# Check if passwords match
if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    echo -e "${RED}Passwords do not match. Please try again.${NC}"
    exit 1
fi

# Check password strength
if [ ${#NEW_PASSWORD} -lt 8 ]; then
    echo -e "${RED}Password is too short. It must be at least 8 characters.${NC}"
    exit 1
fi

# Generate a MongoDB script to update the password
echo -e "${YELLOW}Generating password hash...${NC}"

# Run a Node.js script to hash the password
HASH=$(node -e "
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('$NEW_PASSWORD', salt);
console.log(hash);
")

if [ -z "$HASH" ]; then
    echo -e "${RED}Failed to generate password hash. Make sure bcryptjs is installed.${NC}"
    echo "Try running: npm install -g bcryptjs"
    exit 1
fi

echo -e "${YELLOW}Updating admin password in the database...${NC}"

# Update the password in MongoDB
RESULT=$(docker-compose exec -T mongodb mongosh admin -u admin -p securepassword --quiet --eval "
db.getSiblingDB('tgdmemory').users.updateOne(
  { email: 'admin@tgdmemory.com' },
  { \$set: { password: '$HASH', updatedAt: new Date() } }
);
")

if echo "$RESULT" | grep -q "\"matchedCount\" : 1"; then
    echo -e "${GREEN}Admin password has been successfully reset.${NC}"
    echo -e "You can now login with:"
    echo -e "Email: ${YELLOW}admin@tgdmemory.com${NC}"
    echo -e "Password: ${YELLOW}(your new password)${NC}"
else
    echo -e "${RED}Failed to update admin password.${NC}"
    echo "Error: $RESULT"
    echo "Make sure the MongoDB container is running and the admin user exists."
    exit 1
fi
