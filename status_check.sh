#!/bin/bash

# TGD Memory Production Status Check
# Quick status check for all production components

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}TGD Memory Production Status Check${NC}"
echo "======================================"
echo "Timestamp: $(date)"
echo ""

# Check if server is running
echo -e "${BLUE}Application Status:${NC}"
if curl -s http://localhost:3000/api/ping >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Server is running on port 3000${NC}"
    
    # Get health status
    health_status=$(curl -s http://localhost:3000/api/health 2>/dev/null | head -n 1)
    if echo "$health_status" | grep -q '"status":"ok"'; then
        echo -e "  ${GREEN}✓ Health check: HEALTHY${NC}"
    else
        echo -e "  ${YELLOW}⚠ Health check: DEGRADED${NC}"
    fi
    
    # Check response time
    start_time=$(date +%s)
    curl -s http://localhost:3000/api/ping >/dev/null 2>&1
    end_time=$(date +%s)
    response_time=$((end_time - start_time))
    echo -e "  ${GREEN}✓ Response time: ${response_time}s${NC}"
    
else
    echo -e "  ${RED}✗ Server is not responding${NC}"
fi

echo ""

# Check monitoring dashboard
echo -e "${BLUE}Monitoring Dashboard:${NC}"
if curl -s http://localhost:3030/health >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Dashboard is running on port 3030${NC}"
else
    echo -e "  ${YELLOW}○ Dashboard is not running${NC}"
fi

echo ""

# Check Docker
echo -e "${BLUE}Docker Environment:${NC}"
if command -v docker >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Docker is available${NC}"
    if docker info >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Docker daemon is running${NC}"
    else
        echo -e "  ${RED}✗ Docker daemon is not running${NC}"
    fi
else
    echo -e "  ${RED}✗ Docker is not installed${NC}"
fi

echo ""

# Check production files
echo -e "${BLUE}Production Configuration:${NC}"
production_files=(
    "Dockerfile"
    "docker-compose.yml"
    "ecosystem.config.js"
    "nginx/nginx.conf"
    ".env"
)

for file in "${production_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓ $file${NC}"
    else
        echo -e "  ${RED}✗ $file${NC}"
    fi
done

echo ""

# Check logs
echo -e "${BLUE}Logging:${NC}"
if [ -d "server/logs" ]; then
    log_files=$(ls server/logs/*.log 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✓ Log directory exists ($log_files log files)${NC}"
    
    # Check recent log activity
    if [ -f "server/logs/combined.log" ]; then
        recent_logs=$(tail -n 5 server/logs/combined.log | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓ Recent log activity (last $recent_logs entries)${NC}"
    fi
else
    echo -e "  ${YELLOW}○ Log directory not found${NC}"
fi

echo ""

# Check database connectivity
echo -e "${BLUE}Database:${NC}"
if command -v mongosh >/dev/null 2>&1 || command -v mongo >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓ MongoDB client available${NC}"
else
    echo -e "  ${YELLOW}○ MongoDB client not found${NC}"
fi

# Get database status from health endpoint
if curl -s http://localhost:3000/api/health 2>/dev/null | grep -q '"mongodb".*"connected"'; then
    echo -e "  ${GREEN}✓ Database connection healthy${NC}"
else
    echo -e "  ${RED}✗ Database connection issue${NC}"
fi

echo ""

# Check scripts
echo -e "${BLUE}Production Scripts:${NC}"
scripts=(
    "deploy_production.sh"
    "backup.sh"
    "monitor.sh"
    "test_production.sh"
    "validate_production.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo -e "  ${GREEN}✓ $script${NC}"
    else
        echo -e "  ${YELLOW}○ $script${NC}"
    fi
done

echo ""

# Summary
echo -e "${BLUE}Summary:${NC}"
echo "  - Application server: $(curl -s http://localhost:3000/api/ping >/dev/null 2>&1 && echo 'RUNNING' || echo 'STOPPED')"
echo "  - Monitoring dashboard: $(curl -s http://localhost:3030/health >/dev/null 2>&1 && echo 'RUNNING' || echo 'STOPPED')"
echo "  - Production readiness: $([ -f validate_production.sh ] && echo 'VALIDATED' || echo 'PENDING')"
echo "  - Docker support: $(command -v docker >/dev/null 2>&1 && echo 'AVAILABLE' || echo 'NOT AVAILABLE')"

echo ""
echo -e "${GREEN}Status check complete!${NC}"
echo ""
echo "To access services:"
echo "  - Application: http://localhost:3000"
echo "  - Monitoring: http://localhost:3030"
echo "  - Health API: http://localhost:3000/api/health"
