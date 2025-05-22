#!/bin/bash
# filepath: /Users/markomanninen/Documents/GitHub/tgdmemory/tgdmemory/clean_caches.sh
# clean_caches.sh - Shell script to clean equation explanation caches

# Set working directory to the script's location
cd "$(dirname "$0")"

echo "===== TGD Memory Equation Explanation Cache Cleaner ====="
echo ""

# Check if server directory exists
if [ ! -d "./server" ]; then
  echo "Error: server directory not found!"
  exit 1
fi

# Run the cache cleaner script
node ./server/clean-caches.js

echo ""
echo "Done!"
