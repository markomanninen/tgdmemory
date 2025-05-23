#!/bin/bash

# TGD Memory Production Monitoring Script
# Monitors application health, performance, and alerts on issues

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/monitor.conf"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/tgdmemory-monitor.log"
ALERT_LOG="$LOG_DIR/tgdmemory-alerts.log"

# Default configuration
APP_URL="${APP_URL:-http://localhost:3000}"
PM2_APP_NAME="${PM2_APP_NAME:-tgdmemory-server}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
WEBHOOK_URL="${WEBHOOK_URL:-}"
CPU_THRESHOLD="${CPU_THRESHOLD:-80}"
MEMORY_THRESHOLD="${MEMORY_THRESHOLD:-80}"
DISK_THRESHOLD="${DISK_THRESHOLD:-85}"
RESPONSE_TIME_THRESHOLD="${RESPONSE_TIME_THRESHOLD:-5}"

# Load configuration if exists
[ -f "$CONFIG_FILE" ] && source "$CONFIG_FILE"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

alert() {
    local message="[ALERT $(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$ALERT_LOG"
    send_alert "$1"
}

warning() {
    local message="[WARNING $(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="[OK $(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Alert sending function
send_alert() {
    local message="$1"
    
    # Send email alert
    if [ -n "$ALERT_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "TGD Memory Alert" "$ALERT_EMAIL"
    fi
    
    # Send webhook alert
    if [ -n "$WEBHOOK_URL" ] && command -v curl &> /dev/null; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"TGD Memory Alert: $message\"}" \
            &> /dev/null || true
    fi
}

# Health checks
check_application_health() {
    log "Checking application health..."
    
    # Check if application is responding
    local start_time=$(date +%s)
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$APP_URL/api/ping" || echo "000")
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    if [ "$response" != "200" ]; then
        alert "Application health check failed - HTTP $response"
        return 1
    fi
    
    if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
        warning "Slow response time: ${response_time}s (threshold: ${RESPONSE_TIME_THRESHOLD}s)"
    fi
    
    success "Application responding (${response_time}s)"
    return 0
}

check_detailed_health() {
    log "Checking detailed health endpoint..."
    
    local health_response=$(curl -s "$APP_URL/api/health" 2>/dev/null || echo '{"status":"error"}')
    local status=$(echo "$health_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    case "$status" in
        "ok")
            success "Detailed health check passed"
            ;;
        "degraded")
            warning "Application health degraded"
            ;;
        *)
            alert "Detailed health check failed - Status: $status"
            return 1
            ;;
    esac
    
    return 0
}

check_pm2_status() {
    log "Checking PM2 process status..."
    
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 not found, skipping process check"
        return 0
    fi
    
    local pm2_status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$PM2_APP_NAME\") | .pm2_env.status" || echo "not_found")
    
    case "$pm2_status" in
        "online")
            success "PM2 process online"
            ;;
        "stopped")
            alert "PM2 process stopped, attempting restart..."
            pm2 start "$PM2_APP_NAME" || alert "Failed to restart PM2 process"
            ;;
        "errored")
            alert "PM2 process in error state"
            return 1
            ;;
        "not_found")
            alert "PM2 process not found"
            return 1
            ;;
        *)
            warning "PM2 process status unknown: $pm2_status"
            ;;
    esac
    
    return 0
}

check_system_resources() {
    log "Checking system resources..."
    
    # CPU usage (macOS compatible)
    local cpu_usage=""
    if command -v top &> /dev/null; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
        else
            # Linux
            cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' | awk -F'us' '{print $1}')
        fi
    fi
    
    if [ -n "$cpu_usage" ] && command -v bc &> /dev/null; then
        if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
            warning "High CPU usage: ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)"
        fi
    else
        cpu_usage="N/A"
    fi
    
    # Memory usage (macOS compatible)
    local memory_usage=""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v vm_stat &> /dev/null; then
            local page_size=$(vm_stat | grep "page size" | awk '{print $8}')
            local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
            local pages_active=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
            local pages_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
            local pages_speculative=$(vm_stat | grep "Pages speculative" | awk '{print $3}' | sed 's/\.//')
            local pages_wired=$(vm_stat | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
            
            if [ -n "$page_size" ] && [ -n "$pages_free" ]; then
                local total_pages=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
                local used_pages=$((pages_active + pages_inactive + pages_speculative + pages_wired))
                memory_usage=$(echo "scale=1; $used_pages * 100 / $total_pages" | bc -l)
            fi
        fi
    else
        # Linux
        if command -v free &> /dev/null; then
            memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
        fi
    fi
    
    if [ -n "$memory_usage" ] && command -v bc &> /dev/null; then
        if (( $(echo "$memory_usage > $MEMORY_THRESHOLD" | bc -l) )); then
            warning "High memory usage: ${memory_usage}% (threshold: ${MEMORY_THRESHOLD}%)"
        fi
    else
        memory_usage="N/A"
    fi
    
    # Disk usage (works on both macOS and Linux)
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        alert "High disk usage: ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)"
    fi
    
    success "System resources check completed - CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
}

check_database_connection() {
    log "Checking database connection..."
    
    # Check MongoDB connection through application
    local db_response=$(curl -s "$APP_URL/api/health" 2>/dev/null | grep -o '"mongodb":{[^}]*}' || echo '')
    
    if echo "$db_response" | grep -q '"status":"connected"'; then
        success "Database connection healthy"
    else
        alert "Database connection issue detected"
        return 1
    fi
    
    return 0
}

check_ssl_certificate() {
    if [[ "$APP_URL" == https* ]]; then
        log "Checking SSL certificate..."
        
        local domain=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
        local cert_expiry=$(openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [ -n "$cert_expiry" ]; then
            local expiry_epoch=$(date -d "$cert_expiry" +%s)
            local current_epoch=$(date +%s)
            local days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [ "$days_left" -lt 30 ]; then
                alert "SSL certificate expires in $days_left days"
            elif [ "$days_left" -lt 7 ]; then
                alert "SSL certificate expires in $days_left days - URGENT"
            else
                success "SSL certificate valid ($days_left days remaining)"
            fi
        else
            warning "Could not check SSL certificate expiry"
        fi
    fi
}

check_log_files() {
    log "Checking log files for errors..."
    
    local error_count=0
    local log_dirs=(
        "/opt/tgdmemory/current/server/logs"
        "$SCRIPT_DIR/server/logs"
        "/var/log"
    )
    
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            # Check for recent errors (last 5 minutes)
            local recent_errors=$(find "$log_dir" -name "*.log" -type f -mmin -5 -exec grep -l "ERROR\|Error\|error" {} \; 2>/dev/null | wc -l)
            error_count=$((error_count + recent_errors))
        fi
    done
    
    if [ "$error_count" -gt 0 ]; then
        warning "Found $error_count log files with recent errors"
    else
        success "No recent errors in log files"
    fi
}

generate_status_report() {
    local report_file="/tmp/tgdmemory-status-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
TGD Memory Application Status Report
Generated: $(date)
===========================================

System Information:
- Hostname: $(hostname)
- Uptime: $(uptime -p)
- Load Average: $(uptime | awk -F'load average:' '{print $2}')
- Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')
- Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')

Application Status:
- URL: $APP_URL
- PM2 Process: $(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$PM2_APP_NAME\") | .pm2_env.status" || echo "Unknown")
- Health Check: $(curl -s "$APP_URL/api/ping" &>/dev/null && echo "OK" || echo "FAILED")

Recent Alerts:
$(tail -n 10 "$ALERT_LOG" 2>/dev/null || echo "No recent alerts")

Log File Sizes:
$(find /opt/tgdmemory/current/server/logs -name "*.log" -exec ls -lh {} \; 2>/dev/null || echo "No log files found")
EOF

    echo "$report_file"
}

# Main monitoring function
run_checks() {
    log "Starting monitoring checks..."
    
    local failed_checks=0
    
    check_application_health || ((failed_checks++))
    check_detailed_health || ((failed_checks++))
    check_pm2_status || ((failed_checks++))
    check_system_resources
    check_database_connection || ((failed_checks++))
    check_ssl_certificate
    check_log_files
    
    if [ "$failed_checks" -gt 0 ]; then
        alert "$failed_checks critical checks failed"
        return 1
    else
        success "All monitoring checks passed"
        return 0
    fi
}

# Continuous monitoring mode
monitor_continuous() {
    log "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    
    while true; do
        run_checks
        
        # Generate hourly status reports
        if [ $(($(date +%M))) -eq 0 ]; then
            local report=$(generate_status_report)
            log "Status report generated: $report"
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# CLI interface
case "${1:-check}" in
    "check"|"")
        run_checks
        ;;
    "monitor")
        monitor_continuous
        ;;
    "report")
        report=$(generate_status_report)
        cat "$report"
        echo "Report saved to: $report"
        ;;
    "test-alert")
        alert "Test alert from monitoring system"
        ;;
    *)
        echo "Usage: $0 [check|monitor|report|test-alert]"
        echo "  check    - Run health checks once (default)"
        echo "  monitor  - Run continuous monitoring"
        echo "  report   - Generate status report"
        echo "  test-alert - Send test alert"
        exit 1
        ;;
esac
