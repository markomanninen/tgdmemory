#!/bin/bash

# TGD Memory Production Deployment Script
# This script handles the deployment of the TGD Memory project to production

# Set strict error handling
set -e
set -o pipefail

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define paths and configuration
PROJECT_DIR="$(pwd)"
SERVER_DIR="$PROJECT_DIR/server"
ENV_FILE="$PROJECT_DIR/.env"
PROD_ENV_TEMPLATE="$PROJECT_DIR/production.env.template"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/deployment.log"
PM2_APP_NAME="tgdmemory-server"

# Check if running in production
if [ "$NODE_ENV" != "production" ]; then
  echo -e "${YELLOW}Warning: Not running in production mode${NC}"
  echo -e "Setting NODE_ENV=production for this deployment"
  export NODE_ENV=production
fi

# Step 1: Check if PM2 is installed
echo -e "${GREEN}Checking dependencies...${NC}"
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 is not installed. Installing globally...${NC}"
  npm install -g pm2
  echo -e "${GREEN}PM2 installed successfully${NC}"
else
  echo -e "${GREEN}PM2 is already installed${NC}"
fi

# Step 2: Check for production environment file
echo -e "${GREEN}Checking environment configuration...${NC}"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: .env file not found${NC}"
  echo -e "Please create a .env file based on the template at $PROD_ENV_TEMPLATE"
  exit 1
fi

# Step 3: Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm ci --production
cd "$SERVER_DIR" && npm ci --production
cd "$PROJECT_DIR"

# Step 4: Clean caches
echo -e "${GREEN}Cleaning caches...${NC}"
npm run clean-caches

# Step 5: Build frontend
echo -e "${GREEN}Building frontend...${NC}"
npm run build:prod

# Step 6: Check MongoDB connection
echo -e "${GREEN}Checking MongoDB connection...${NC}"
if grep -q "MONGODB_URI" "$ENV_FILE"; then
  echo -e "${GREEN}MongoDB URI found in .env file${NC}"
  # Extract MongoDB URI and test connection
  MONGODB_URI=$(grep "MONGODB_URI" "$ENV_FILE" | cut -d '=' -f2)
  
  # Basic check if the URI looks valid
  if [[ $MONGODB_URI == mongodb://* || $MONGODB_URI == mongodb+srv://* ]]; then
    echo -e "${GREEN}MongoDB URI format looks valid${NC}"
  else
    echo -e "${RED}Warning: MongoDB URI format does not look standard${NC}"
    echo -e "Please verify your MongoDB connection string in the .env file"
  fi
else
  echo -e "${RED}Warning: MONGODB_URI not found in .env file${NC}"
  echo -e "The application may not function correctly without a database connection"
fi

# Step 7: Start server with PM2
echo -e "${GREEN}Starting server with PM2...${NC}"
cd "$SERVER_DIR"
pm2 describe tgdmemory-server > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${YELLOW}Server already running in PM2, restarting...${NC}"
  npm run pm2:restart
else
  echo -e "${GREEN}Starting new PM2 instance...${NC}"
  NODE_ENV=production npm run pm2:start
fi

# Step 8: Set up PM2 to start on system boot
echo -e "${GREEN}Setting up PM2 to start on system boot...${NC}"
pm2 save
pm2 startup | tail -n 1

# Step 9: Serve static files
echo -e "${GREEN}Setting up frontend files...${NC}"
cd "$PROJECT_DIR"
mkdir -p /var/www/tgdmemory || true
cp -r dist/* /var/www/tgdmemory/

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "Frontend files are in /var/www/tgdmemory/"
echo -e "Backend server is running with PM2 (name: tgdmemory-server)"
echo -e "Use 'pm2 logs tgdmemory-server' to view server logs"
