#!/bin/bash

# Performance monitoring script for TGD Memory application
# Collects and reports performance metrics for production monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METRICS_DIR="$SCRIPT_DIR/metrics"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
METRICS_FILE="$METRICS_DIR/metrics_$TIMESTAMP.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure metrics directory exists
mkdir -p "$METRICS_DIR"

echo -e "${BLUE}TGD Memory Performance Monitor${NC}"
echo "=================================================="
echo "Timestamp: $(date)"
echo ""

# Function to check if application is running
check_app_status() {
    local status="down"
    local pid=""
    
    if pgrep -f "node.*server.js" > /dev/null; then
        status="running"
        pid=$(pgrep -f "node.*server.js")
    fi
    
    echo "\"app_status\": \"$status\", \"app_pid\": \"$pid\""
}

# Function to collect system metrics
collect_system_metrics() {
    echo "\"system_metrics\": {"
    
    # CPU usage
    local cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    echo "  \"cpu_usage_percent\": \"$cpu_usage\","
    
    # Memory usage
    local memory_info=$(vm_stat)
    local pages_free=$(echo "$memory_info" | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local pages_active=$(echo "$memory_info" | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
    local pages_inactive=$(echo "$memory_info" | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
    local pages_wired=$(echo "$memory_info" | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
    
    # Convert pages to MB (assuming 4KB pages)
    local page_size=4096
    local free_mb=$((pages_free * page_size / 1024 / 1024))
    local used_mb=$(((pages_active + pages_inactive + pages_wired) * page_size / 1024 / 1024))
    local total_mb=$((free_mb + used_mb))
    
    echo "  \"memory_total_mb\": \"$total_mb\","
    echo "  \"memory_used_mb\": \"$used_mb\","
    echo "  \"memory_free_mb\": \"$free_mb\","
    
    # Disk usage
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "  \"disk_usage_percent\": \"$disk_usage\","
    
    # Load average
    local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | xargs)
    echo "  \"load_average\": \"$load_avg\","
    
    # Number of processes
    local process_count=$(ps aux | wc -l | xargs)
    echo "  \"process_count\": \"$process_count\""
    
    echo "}"
}

# Function to collect application metrics
collect_app_metrics() {
    echo "\"app_metrics\": {"
    
    local app_pid=$(pgrep -f "node.*server.js")
    if [ -n "$app_pid" ]; then
        # Memory usage of the Node.js process
        local app_memory=$(ps -o rss= -p "$app_pid" 2>/dev/null | xargs)
        local app_memory_mb=$((app_memory / 1024))
        
        # CPU usage of the Node.js process
        local app_cpu=$(ps -o %cpu= -p "$app_pid" 2>/dev/null | xargs)
        
        echo "  \"memory_usage_mb\": \"$app_memory_mb\","
        echo "  \"cpu_usage_percent\": \"$app_cpu\","
        
        # Check if PM2 is managing the process
        if command -v pm2 >/dev/null 2>&1; then
            local pm2_status=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="tgdmemory-server") | .pm2_env.status' 2>/dev/null || echo "not_managed")
            echo "  \"pm2_status\": \"$pm2_status\","
        fi
    else
        echo "  \"memory_usage_mb\": \"0\","
        echo "  \"cpu_usage_percent\": \"0\","
        echo "  \"pm2_status\": \"not_running\","
    fi
    
    # Check log file sizes
    local error_log_size="0"
    local combined_log_size="0"
    
    if [ -f "$SCRIPT_DIR/server/logs/error.log" ]; then
        error_log_size=$(du -k "$SCRIPT_DIR/server/logs/error.log" | cut -f1)
    fi
    
    if [ -f "$SCRIPT_DIR/server/logs/combined.log" ]; then
        combined_log_size=$(du -k "$SCRIPT_DIR/server/logs/combined.log" | cut -f1)
    fi
    
    echo "  \"error_log_size_kb\": \"$error_log_size\","
    echo "  \"combined_log_size_kb\": \"$combined_log_size\""
    
    echo "}"
}

# Function to test application health
test_app_health() {
    echo "\"health_checks\": {"
    
    local port=${PORT:-3000}
    local health_status="fail"
    local response_time="0"
    local http_status="0"
    
    # Test main health endpoint
    if command -v curl >/dev/null 2>&1; then
        local start_time=$(date +%s%N)
        local http_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/api/health" 2>/dev/null || echo "000")
        local end_time=$(date +%s%N)
        
        http_status="$http_response"
        response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [ "$http_response" = "200" ]; then
            health_status="pass"
        fi
    fi
    
    echo "  \"endpoint_health\": \"$health_status\","
    echo "  \"http_status\": \"$http_status\","
    echo "  \"response_time_ms\": \"$response_time\","
    
    # Test database connectivity through app
    local db_status="unknown"
    if [ "$health_status" = "pass" ]; then
        local db_response=$(curl -s "http://localhost:$port/api/health" 2>/dev/null | grep -o '"mongodb"[^}]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4 2>/dev/null || echo "unknown")
        db_status="$db_response"
    fi
    
    echo "  \"database_status\": \"$db_status\""
    
    echo "}"
}

# Function to collect cache metrics
collect_cache_metrics() {
    echo "\"cache_metrics\": {"
    
    local cache_dir="$SCRIPT_DIR/server/explanations-cache"
    local public_cache_dir="$SCRIPT_DIR/public/explanations-cache"
    
    local cache_files=0
    local public_cache_files=0
    local cache_size_kb=0
    local public_cache_size_kb=0
    
    if [ -d "$cache_dir" ]; then
        cache_files=$(find "$cache_dir" -name "*.json" | wc -l | xargs)
        cache_size_kb=$(du -sk "$cache_dir" 2>/dev/null | cut -f1 || echo "0")
    fi
    
    if [ -d "$public_cache_dir" ]; then
        public_cache_files=$(find "$public_cache_dir" -name "*.json" | wc -l | xargs)
        public_cache_size_kb=$(du -sk "$public_cache_dir" 2>/dev/null | cut -f1 || echo "0")
    fi
    
    echo "  \"server_cache_files\": \"$cache_files\","
    echo "  \"server_cache_size_kb\": \"$cache_size_kb\","
    echo "  \"public_cache_files\": \"$public_cache_files\","
    echo "  \"public_cache_size_kb\": \"$public_cache_size_kb\""
    
    echo "}"
}

# Main execution
echo "Collecting performance metrics..."

# Create JSON metrics file
{
    echo "{"
    echo "\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "\"hostname\": \"$(hostname)\","
    echo "\"environment\": \"${NODE_ENV:-development}\","
    check_app_status
    echo ","
    collect_system_metrics
    echo ","
    collect_app_metrics
    echo ","
    test_app_health
    echo ","
    collect_cache_metrics
    echo "}"
} > "$METRICS_FILE"

# Display summary
echo ""
echo -e "${GREEN}Performance Summary${NC}"
echo "==================="

# Parse and display key metrics
if command -v jq >/dev/null 2>&1; then
    echo -e "App Status: ${GREEN}$(jq -r '.app_status' "$METRICS_FILE")${NC}"
    echo -e "Health Check: $(jq -r '.health_checks.endpoint_health' "$METRICS_FILE" | sed 's/pass/\\033[0;32mpass\\033[0m/g; s/fail/\\033[0;31mfail\\033[0m/g')"
    echo -e "CPU Usage: $(jq -r '.system_metrics.cpu_usage_percent' "$METRICS_FILE")%"
    echo -e "Memory Usage: $(jq -r '.system_metrics.memory_used_mb' "$METRICS_FILE")MB / $(jq -r '.system_metrics.memory_total_mb' "$METRICS_FILE")MB"
    echo -e "Disk Usage: $(jq -r '.system_metrics.disk_usage_percent' "$METRICS_FILE")%"
    echo -e "App Memory: $(jq -r '.app_metrics.memory_usage_mb' "$METRICS_FILE")MB"
    echo -e "Response Time: $(jq -r '.health_checks.response_time_ms' "$METRICS_FILE")ms"
    echo -e "Cache Files: $(jq -r '.cache_metrics.server_cache_files' "$METRICS_FILE") server / $(jq -r '.cache_metrics.public_cache_files' "$METRICS_FILE") public"
else
    echo "jq not available - metrics saved to: $METRICS_FILE"
fi

echo ""
echo "Detailed metrics saved to: $METRICS_FILE"

# Optional: Send metrics to monitoring system
if [ -n "$MONITORING_WEBHOOK_URL" ]; then
    echo "Sending metrics to monitoring system..."
    curl -X POST -H "Content-Type: application/json" -d @"$METRICS_FILE" "$MONITORING_WEBHOOK_URL" 2>/dev/null && echo "Metrics sent successfully" || echo "Failed to send metrics"
fi

# Cleanup old metrics files (keep last 7 days)
find "$METRICS_DIR" -name "metrics_*.json" -mtime +7 -delete 2>/dev/null

echo ""
echo -e "${BLUE}Performance monitoring complete.${NC}"
