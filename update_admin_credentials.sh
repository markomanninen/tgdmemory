#!/bin/zsh
# update_admin_credentials.sh - Script to update the admin credentials in MongoDB

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${YELLOW}TGD Memory Admin Credentials Update${NC}"
echo "This script will update the admin user's password in the MongoDB database."
echo "It will set the password to 'admin123' which matches the initialization script."
echo

# Get confirmation in zsh
echo -n "Do you want to continue? (y/n): "
read CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 1
fi

echo "${YELLOW}Updating admin password...${NC}"

# Direct MongoDB update with JS code
echo "Executing MongoDB update..."
docker-compose exec mongodb mongosh admin -u admin -p securepassword --quiet --eval '
  db.getSiblingDB("tgdmemory").users.updateOne(
    { email: "admin@tgdmemory.com" },
    { $set: { 
      password: "$2b$10$Xn.i0FB1YkmPN5tLnb2Yru7CtkF.zw77HbxCf3ijyGB9C189d73h.",
      updatedAt: new Date()
    } }
  );

  // Print the result
  var user = db.getSiblingDB("tgdmemory").users.findOne({ email: "admin@tgdmemory.com" });
  if (user) {
    print("User found with ID: " + user._id);
    print("Password updated!");
  } else {
    print("User not found!");
  }
'

if [ $? -eq 0 ]; then
  echo "${GREEN}Admin password updated successfully!${NC}"
  echo "You can now log in with:"
  echo "  Email: ${YELLOW}admin@tgdmemory.com${NC}"
  echo "  Password: ${YELLOW}admin123${NC}"
else
  echo "${RED}Failed to update admin password${NC}"
fi

# Verify user exists
echo "${YELLOW}Verifying user...${NC}"
docker-compose exec mongodb mongosh admin -u admin -p securepassword --quiet --eval '
  var user = db.getSiblingDB("tgdmemory").users.findOne({ email: "admin@tgdmemory.com" });
  if (user) {
    print("User verification successful!");
    print("Username: " + user.username);
    print("Email: " + user.email);
    print("Roles: " + user.roles);
  } else {
    print("User not found!");
  }
'
