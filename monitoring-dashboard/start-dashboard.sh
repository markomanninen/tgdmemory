#!/bin/bash
cd "$(dirname "${BASH_SOURCE[0]}")"
echo "Starting TGD Memory Monitoring Dashboard..."
PORT=3030 node server.js
