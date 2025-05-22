#!/bin/bash
# setup.sh - Setup and test the equation explanation server

echo "Setting up Equation Explanation Server..."

# Create a proper .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
  echo "Please edit .env file to add your API keys and configure models."
  echo "Available models:"
  echo "  - OpenAI: gpt-4-turbo, gpt-4o, gpt-3.5-turbo, etc."
  echo "  - Gemini: gemini-2.5-flash-preview-05-20 (recommended), gemini-pro, etc."
  echo
  echo "We recommend using the latest Gemini 2.5 Flash model for equation explanations:"
  echo "GEMINI_MODEL=gemini-2.5-flash-preview-05-20"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create cache directory if it doesn't exist
mkdir -p explanations-cache

echo "Setup complete!"
echo
echo "To start the server, run:"
echo "npm run dev    # Development mode with auto-restart"
echo "npm start      # Production mode"
echo
echo "Testing server functionality requires API keys in the .env file."
