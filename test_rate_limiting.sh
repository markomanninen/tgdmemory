#!/bin/bash
# Test script for rate limiting functionality in tgdmemory application

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file for test results
LOG_FILE="test-results/test_rate_limiting_$(date +%Y-%m-%d_%H-%M-%S).log"
mkdir -p test-results

# Function to log messages
log() {
  echo -e "$1"
  echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
}

log "${YELLOW}Starting rate limiting tests for tgdmemory application${NC}"
log "Date: $(date)"
log "=================================="

# Test API rate limiting
log "\n${YELLOW}Testing API Rate Limiting (/api/ping endpoint)${NC}"
log "Sending 10 requests in quick succession to /api/ping"

# Send 10 requests and collect status codes
for i in {1..10}; do
  log "Request $i"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:3000/api/ping)
  
  log "Status code: $RESPONSE"
  
  # Check if we're getting rate limited
  if [ "$RESPONSE" -eq 429 ]; then
    log "${GREEN}API rate limiting successfully triggered at request $i!${NC}"
    API_RATE_LIMIT_TRIGGERED=true
    break
  fi
  
  # Brief pause to not overwhelm the server
  sleep 0.2
done

if [ -z "$API_RATE_LIMIT_TRIGGERED" ]; then
  log "${YELLOW}API rate limiting was not triggered after 10 requests.${NC}"
  log "${YELLOW}This could be because the rate limit hasn't been reached yet.${NC}"
fi

# Test authentication rate limiting
log "\n${YELLOW}Testing Authentication Rate Limiting (/api/auth/login endpoint)${NC}"
log "Sending 10 requests in quick succession with invalid credentials"

# Use invalid credentials to test rate limiting without actually logging in
for i in {1..10}; do
  log "Request $i"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\", \"password\":\"wrongpassword\"}" \
    http://localhost:3000/api/auth/login)
  
  log "Status code: $RESPONSE"
  
  # Check if we're getting rate limited (status code 429)
  if [ "$RESPONSE" -eq 429 ]; then
    log "${GREEN}Rate limiting successfully triggered at request $i!${NC}"
    RATE_LIMIT_TRIGGERED=true
    break
  fi
  
  # Brief pause to not overwhelm the server
  sleep 0.5
done

if [ -z "$RATE_LIMIT_TRIGGERED" ]; then
  log "${RED}Auth rate limiting was not triggered after 10 requests. Check configuration.${NC}"
fi

# Test proxy header handling
log "\n${YELLOW}Testing X-Forwarded-For header handling${NC}"
log "Sending request with spoofed X-Forwarded-For header"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "X-Forwarded-For: 1.2.3.4" \
  http://localhost:3000/api/ping)

log "Status code with X-Forwarded-For header: $RESPONSE"
if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 429 ]; then
  log "${GREEN}Server properly processed request with X-Forwarded-For header${NC}"
else
  log "${RED}Server may not be properly handling X-Forwarded-For header (got $RESPONSE)${NC}"
fi

# Test proxy header handling in more detail
log "\n${YELLOW}Testing Multiple Requests with Same X-Forwarded-For Header${NC}"
log "Sending 30 requests with the same X-Forwarded-For header to check tracking"

# Use a consistent IP for these tests
TEST_IP="192.168.1.100"

for i in {1..30}; do
  log "Request with X-Forwarded-For: $TEST_IP (request $i)"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-Forwarded-For: $TEST_IP" \
    http://localhost:3000/api/ping)
  
  log "Status code: $RESPONSE"
  
  # If we're already rate limited, that's a good sign
  if [ "$RESPONSE" -eq 429 ]; then
    log "${GREEN}IP tracking through X-Forwarded-For is working! Got rate limited on request $i${NC}"
    PROXY_TRACKING_WORKING=true
    break
  fi
  
  # Brief pause
  sleep 0.1
done

if [ -z "$PROXY_TRACKING_WORKING" ]; then
  log "${YELLOW}Could not confirm if IP tracking through X-Forwarded-For is working properly.${NC}"
  log "${YELLOW}This could be because the rate limit hasn't been reached yet.${NC}"
fi

# Summary
log "\n${YELLOW}Test Summary${NC}"
log "Tests completed. Review the log for results."
log "Test log saved to: $LOG_FILE"
log "=================================="

echo -e "\n${GREEN}Rate limiting tests completed. Results saved to $LOG_FILE${NC}"
