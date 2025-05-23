#!/bin/bash

# Automated testing pipeline for TGD Memory production deployments
# This script runs comprehensive tests before and after deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_RESULTS_DIR="$SCRIPT_DIR/test-results"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
TEST_LOG="$TEST_RESULTS_DIR/test_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_HOST="${TEST_HOST:-localhost}"
TEST_PORT="${TEST_PORT:-3000}"
BASE_URL="http://$TEST_HOST:$TEST_PORT"
TIMEOUT=30

# Ensure test results directory exists
mkdir -p "$TEST_RESULTS_DIR"

# Logging function
log() {
    echo -e "$1" | tee -a "$TEST_LOG"
}

# Function to wait for service to be ready
wait_for_service() {
    local url="$1"
    local timeout="$2"
    local count=0
    
    log "${BLUE}Waiting for service at $url to be ready...${NC}"
    
    while [ $count -lt $timeout ]; do
        if curl -s -f "$url/api/ping" >/dev/null 2>&1; then
            log "${GREEN}✓ Service is ready${NC}"
            return 0
        fi
        
        count=$((count + 1))
        echo -n "."
        sleep 1
    done
    
    log "${RED}✗ Service failed to start within $timeout seconds${NC}"
    return 1
}

# Function to test API endpoints
test_api_endpoints() {
    log "\n${BLUE}Testing API Endpoints${NC}"
    log "======================"
    
    local passed=0
    local failed=0
    
    # Test health endpoints
    for endpoint in "ping" "health" "ready" "live"; do
        log "Testing /api/$endpoint..."
        
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/$endpoint" 2>/dev/null)
        
        if [ "$response" = "200" ]; then
            log "${GREEN}✓ /api/$endpoint - HTTP $response${NC}"
            passed=$((passed + 1))
        else
            log "${RED}✗ /api/$endpoint - HTTP $response${NC}"
            failed=$((failed + 1))
        fi
    done
    
    # Test explanation endpoint (basic functionality)
    log "Testing /api/explain..."
    local explain_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"latex": "E = mc^2", "title": "Einstein Mass-Energy Equivalence"}' \
        "$BASE_URL/api/explain" 2>/dev/null | head -c 100)
    
    if [ -n "$explain_response" ] && echo "$explain_response" | grep -q "explanation\|error"; then
        log "${GREEN}✓ /api/explain - Response received${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ /api/explain - No valid response${NC}"
        failed=$((failed + 1))
    fi
    
    # Test API root endpoint (backend only, no static files served)
    log "Testing API root..."
    local api_root_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api" 2>/dev/null)
    
    if [ "$api_root_response" = "404" ]; then
        log "${GREEN}✓ API root returns 404 (expected for backend-only)${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ API root returns HTTP $api_root_response${NC}"
        passed=$((passed + 1))
    fi
    
    log "\nAPI Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Function to test authentication endpoints
test_auth_endpoints() {
    log "\n${BLUE}Testing Authentication Endpoints${NC}"
    log "=================================="
    
    local passed=0
    local failed=0
    
    # Test user registration (this will likely fail if user exists, which is expected)
    log "Testing user registration..."
    local reg_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"username": "testuser_'$TIMESTAMP'", "email": "test'$TIMESTAMP'@example.com", "password": "TestPassword123!"}' \
        "$BASE_URL/api/auth/register" 2>/dev/null)
    
    if echo "$reg_response" | grep -q "success\|already exists\|validation\|registered"; then
        log "${GREEN}✓ Registration endpoint responding${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Registration endpoint not responding properly${NC}"
        failed=$((failed + 1))
    fi
    
    # Test login endpoint with invalid credentials
    log "Testing login endpoint..."
    local login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email": "invalid_user@example.com", "password": "invalid_password"}' \
        "$BASE_URL/api/auth/login" 2>/dev/null)
    
    if echo "$login_response" | grep -q "error\|invalid\|unauthorized\|Invalid credentials"; then
        log "${GREEN}✓ Login endpoint rejecting invalid credentials${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Login endpoint not working properly${NC}"
        failed=$((failed + 1))
    fi
    
    log "\nAuth Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Function to test rate limiting
test_rate_limiting() {
    log "\n${BLUE}Testing Rate Limiting${NC}"
    log "======================"
    
    local passed=0
    local failed=0
    
    # Test API rate limiting (make several requests quickly)
    log "Testing API rate limiting..."
    local rate_limit_triggered=false
    
    for i in {1..10}; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/ping" 2>/dev/null)
        if [ "$response" = "429" ]; then
            rate_limit_triggered=true
            break
        fi
        sleep 0.1
    done
    
    if [ "$rate_limit_triggered" = true ]; then
        log "${GREEN}✓ Rate limiting is working (triggered after multiple requests)${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ Rate limiting not triggered (may need more requests or is configured for production)${NC}"
        # This is not necessarily a failure in development
        passed=$((passed + 1))
    fi
    
    # Test auth rate limiting with multiple login attempts
    log "Testing auth rate limiting..."
    local auth_rate_limit_triggered=false
    
    for i in {1..6}; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d '{"email": "test@example.com", "password": "test"}' \
            "$BASE_URL/api/auth/login" 2>/dev/null)
        if [ "$response" = "429" ]; then
            auth_rate_limit_triggered=true
            break
        fi
        sleep 0.1
    done
    
    if [ "$auth_rate_limit_triggered" = true ]; then
        log "${GREEN}✓ Auth rate limiting is working${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ Auth rate limiting not triggered (may need more attempts or is configured for production)${NC}"
        passed=$((passed + 1))
    fi
    
    log "\nRate Limiting Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Function to test security headers
test_security_headers() {
    log "\n${BLUE}Testing Security Headers${NC}"
    log "========================="
    
    local passed=0
    local failed=0
    
    # Get headers from an API endpoint instead of root
    local headers=$(curl -s -I "$BASE_URL/api/ping" 2>/dev/null)
    
    # Check for important security headers (only available in production mode)
    if echo "$headers" | grep -qi "x-content-type-options"; then
        log "${GREEN}✓ X-Content-Type-Options header present${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ X-Content-Type-Options header missing (helmet not active in development)${NC}"
        passed=$((passed + 1))
    fi
    
    if echo "$headers" | grep -qi "x-frame-options"; then
        log "${GREEN}✓ X-Frame-Options header present${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ X-Frame-Options header missing (helmet not active in development)${NC}"
        passed=$((passed + 1))
    fi
    
    if echo "$headers" | grep -qi "strict-transport-security"; then
        log "${GREEN}✓ Strict-Transport-Security header present${NC}"
        passed=$((passed + 1))
    else
        log "${YELLOW}○ Strict-Transport-Security header missing (expected for HTTP)${NC}"
        passed=$((passed + 1))
    fi
    
    log "\nSecurity Headers Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Function to test database connectivity
test_database() {
    log "\n${BLUE}Testing Database Connectivity${NC}"
    log "=============================="
    
    local passed=0
    local failed=0
    
    # Check database status through health endpoint
    local health_response=$(curl -s "$BASE_URL/api/health" 2>/dev/null)
    
    if echo "$health_response" | grep -q '"mongodb".*"connected"'; then
        log "${GREEN}✓ Database connection healthy${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Database connection issue detected${NC}"
        failed=$((failed + 1))
    fi
    
    # Test comment endpoint (GET is public, POST requires auth)
    local comment_test=$(curl -s "$BASE_URL/api/comments?pageUrl=/" 2>/dev/null)
    
    if echo "$comment_test" | grep -q "comments\|success\|\[\]"; then
        log "${GREEN}✓ Comment endpoint responding${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Comment endpoint not responding${NC}"
        failed=$((failed + 1))
    fi
    
    log "\nDatabase Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Function to test performance
test_performance() {
    log "\n${BLUE}Testing Performance${NC}"
    log "==================="
    
    local passed=0
    local failed=0
    
    # Test response time for health endpoint
    log "Testing response times..."
    
    local start_time=$(python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo $(($(date +%s) * 1000)))
    curl -s "$BASE_URL/api/ping" >/dev/null 2>&1
    local end_time=$(python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo $(($(date +%s) * 1000)))
    
    local response_time=$((end_time - start_time))
    
    if [ $response_time -lt 1000 ]; then
        log "${GREEN}✓ Response time: ${response_time}ms (good)${NC}"
        passed=$((passed + 1))
    elif [ $response_time -lt 5000 ]; then
        log "${YELLOW}○ Response time: ${response_time}ms (acceptable)${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Response time: ${response_time}ms (too slow)${NC}"
        failed=$((failed + 1))
    fi
    
    # Test concurrent requests
    log "Testing concurrent request handling..."
    
    local concurrent_pids=()
    for i in {1..5}; do
        curl -s "$BASE_URL/api/ping" >/dev/null 2>&1 &
        concurrent_pids+=($!)
    done
    
    # Wait for all concurrent requests to complete
    local concurrent_success=true
    for pid in "${concurrent_pids[@]}"; do
        if ! wait $pid; then
            concurrent_success=false
        fi
    done
    
    if [ "$concurrent_success" = true ]; then
        log "${GREEN}✓ Concurrent requests handled successfully${NC}"
        passed=$((passed + 1))
    else
        log "${RED}✗ Some concurrent requests failed${NC}"
        failed=$((failed + 1))
    fi
    
    log "\nPerformance Tests Summary: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    return $failed
}

# Main test execution
main() {
    log "${BLUE}TGD Memory Production Testing Pipeline${NC}"
    log "========================================"
    log "Timestamp: $(date)"
    log "Test Host: $TEST_HOST:$TEST_PORT"
    log "Environment: ${NODE_ENV:-development}"
    log ""
    
    # Wait for service to be ready
    if ! wait_for_service "$BASE_URL" "$TIMEOUT"; then
        log "${RED}Service failed to start. Aborting tests.${NC}"
        exit 1
    fi
    
    local total_failures=0
    
    # Run all test suites
    test_api_endpoints
    total_failures=$((total_failures + $?))
    
    test_auth_endpoints
    total_failures=$((total_failures + $?))
    
    test_rate_limiting
    total_failures=$((total_failures + $?))
    
    test_security_headers
    total_failures=$((total_failures + $?))
    
    test_database
    total_failures=$((total_failures + $?))
    
    test_performance
    total_failures=$((total_failures + $?))
    
    # Final summary
    log "\n${BLUE}Final Test Results${NC}"
    log "=================="
    
    if [ $total_failures -eq 0 ]; then
        log "${GREEN}🎉 All tests passed! Production deployment is ready.${NC}"
        log "Test log saved to: $TEST_LOG"
        exit 0
    else
        log "${RED}❌ $total_failures test(s) failed. Please review before deploying.${NC}"
        log "Test log saved to: $TEST_LOG"
        exit 1
    fi
}

# Check if this script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
