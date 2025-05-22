#!/bin/bash
# test_equation_server.sh - Test the equation explanation server functionality

# Set colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Equation Explanation Server...${NC}\n"

# Check if server is running
echo "Checking if server is running on port 3000..."
if nc -z localhost 3000; then
  echo -e "${GREEN}✓ Server is running${NC}"
else
  echo -e "${RED}✗ Server is not running on port 3000${NC}"
  echo "  Please start the server first with: cd server && npm run dev"
  exit 1
fi

# Test basic connectivity
echo -e "\nTesting connectivity to server..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/explanations-cache/)
if [[ "$RESPONSE" == "200" ]]; then
  echo -e "${GREEN}✓ Server is accessible${NC}"
else
  echo -e "${RED}✗ Server connectivity failed (HTTP $RESPONSE)${NC}"
  exit 1
fi

# Test the primary API with a simple equation
echo -e "\nTesting primary API endpoint with a simple equation..."
EQUATION="E = mc^2"
TITLE="Einstein's Energy-Mass Equivalence - Equation 1"

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"latex\": \"$EQUATION\", \"title\": \"$TITLE\"}" \
  http://localhost:3000/api/explain)

if [[ "$RESPONSE" == *"explanation"* ]]; then
  echo -e "${GREEN}✓ Primary API returned an explanation${NC}"
  echo "  Hash: $(echo -n "${EQUATION}${TITLE}" | md5sum | cut -c1-8)"
else
  echo -e "${RED}✗ Primary API failed${NC}"
  echo "  Response: $RESPONSE"
  
  # Try the fallback API
  echo -e "\nTrying fallback API..."
  FALLBACK_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"latex\": \"$EQUATION\", \"title\": \"$TITLE\"}" \
    http://localhost:3000/api/explain-with-gemini)
  
  if [[ "$FALLBACK_RESPONSE" == *"explanation"* ]]; then
    echo -e "${GREEN}✓ Fallback API returned an explanation${NC}"
  else
    echo -e "${RED}✗ Fallback API also failed${NC}"
    echo "  Response: $FALLBACK_RESPONSE"
    
    # Check if any API keys are set
    echo -e "\nChecking for API keys..."
    if [ -f "./server/.env" ]; then
      if grep -q "OPENAI_API_KEY" "./server/.env" && grep -q "GOOGLE_API_KEY" "./server/.env"; then
        echo -e "${YELLOW}API keys appear to be set in .env file but APIs are not responding.${NC}"
        echo "Please check that the keys are valid and have sufficient credits."
      else
        echo -e "${RED}API keys are missing in .env file.${NC}"
        echo "Please add your API keys to server/.env"
      fi
    else
      echo -e "${RED}.env file not found in server directory.${NC}"
      echo "Please run ./setup.sh in the server directory."
    fi
  fi
fi

# Check cache directory
echo -e "\nChecking cache directories..."
if [ -d "./server/explanations-cache" ]; then
  echo -e "${GREEN}✓ Server cache directory exists${NC}"
  if [ "$(ls -A ./server/explanations-cache)" ]; then
    echo -e "${GREEN}✓ Cache directory contains files${NC}"
    ls -l ./server/explanations-cache
  else
    echo -e "${YELLOW}Cache directory is empty${NC}"
  fi
else
  echo -e "${RED}✗ Server cache directory is missing${NC}"
fi

if [ -d "./public/explanations-cache" ]; then
  echo -e "${GREEN}✓ Public cache directory exists${NC}"
else
  echo -e "${YELLOW}Public cache directory not found - will be created when server runs${NC}"
fi

echo -e "\n${YELLOW}Test complete.${NC}"
