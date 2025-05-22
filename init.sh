#!/bin/bash
# init.sh - Initialize the TGD Memory project

# Set colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TGD Memory Project Initialization    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Install main project dependencies
echo -e "${YELLOW}Installing main project dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Main project dependencies installed${NC}"
echo

# Set up the equation explanation server
echo -e "${YELLOW}Setting up the equation explanation server...${NC}"
cd server || { echo "Server directory not found"; exit 1; }

# Create a proper .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
  echo -e "${YELLOW}Please edit server/.env file to add your API keys.${NC}"
fi

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Create cache directory if it doesn't exist
mkdir -p explanations-cache
mkdir -p ../public/explanations-cache

echo -e "${GREEN}✓ Equation server setup complete${NC}"
cd ..
echo

# Inform about running the project
echo -e "${YELLOW}Setup complete!${NC}"
echo 
echo -e "To start the project:"
echo -e "  ${GREEN}npm run dev:all${NC}     # Start both main app and equation server"
echo -e "  ${GREEN}npm run dev${NC}         # Start only the main app"
echo -e "  ${GREEN}npm run start-equation-server${NC} # Start only the equation server"
echo
echo -e "For more information, see:"
echo -e "  ${BLUE}GETTING_STARTED.md${NC}       # Basic setup and usage"
echo -e "  ${BLUE}EQUATION_EXPLANATION.md${NC}  # Detailed info about the equation system"
echo
