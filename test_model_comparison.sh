#!/bin/bash
# filepath: /Users/markomanninen/Documents/GitHub/tgdmemory/tgdmemory/test_model_comparison.sh
# test_model_comparison.sh - Test and compare both AI models for equation explanation

# Set working directory to the script's location
cd "$(dirname "$0")"

echo "======================================"
echo "  EQUATION EXPLANATION MODEL TESTER"
echo "======================================"
echo ""
echo "This script will compare explanations from:"
echo "1. OpenAI GPT-4.1-nano"
echo "2. Google Gemini 2.5 Flash"
echo ""

# Check if server directory exists
if [ ! -d "./server" ]; then
  echo "Error: server directory not found!"
  exit 1
fi

# Move to server directory
cd server

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "No .env file found. Creating from example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
    echo "Please edit .env to add your API keys before running this script again."
    exit 1
  else
    echo "Error: .env.example file not found!"
    exit 1
  fi
fi

# Check for API keys
if ! grep -q "OPENAI_API_KEY=" .env || ! grep -q "GOOGLE_API_KEY=" .env; then
  echo "Warning: API keys may not be set in .env file."
  echo "Please ensure both OPENAI_API_KEY and GOOGLE_API_KEY are properly set."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Run the comparison test
echo "Running model comparison test..."
echo "This will generate explanations using both models for the same equation."
echo ""
npm run test:compare

echo ""
echo "Test completed!"
echo "Review the outputs above to compare model performance."
