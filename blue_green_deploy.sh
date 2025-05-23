#!/bin/bash

# Blue-Green Deployment Strategy for TGD Memory
# Provides zero-downtime deployments by maintaining two identical environments

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_LOG="$SCRIPT_DIR/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BLUE_PORT="${BLUE_PORT:-3001}"
GREEN_PORT="${GREEN_PORT:-3002}"
PROXY_PORT="${PROXY_PORT:-3000}"
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_INTERVAL=5

# Docker configuration
BLUE_CONTAINER="tgdmemory-blue"
GREEN_CONTAINER="tgdmemory-green"
PROXY_CONTAINER="tgdmemory-proxy"

# Load environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
fi

# Logging function
log() {
    echo -e "$1" | tee -a "$DEPLOYMENT_LOG"
}

# Function to check if a service is healthy
check_service_health() {
    local port="$1"
    local timeout="$2"
    local count=0
    
    log "${BLUE}Checking health of service on port $port...${NC}"
    
    while [ $count -lt $timeout ]; do
        if curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1; then
            local response=$(curl -s "http://localhost:$port/api/health" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
            if [ "$response" = "ok" ]; then
                log "${GREEN}✓ Service on port $port is healthy${NC}"
                return 0
            fi
        fi
        
        count=$((count + 1))
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    log "${RED}✗ Service on port $port failed health check${NC}"
    return 1
}

# Function to get current active environment
get_active_environment() {
    # Check which container is currently receiving traffic
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$BLUE_CONTAINER.*Up"; then
        if curl -sf "http://localhost:$PROXY_PORT/api/ping" >/dev/null 2>&1; then
            # Check if proxy is routing to blue or green
            local proxy_config="/tmp/current_upstream"
            if [ -f "$proxy_config" ]; then
                cat "$proxy_config"
            else
                echo "blue" # Default assumption
            fi
        else
            echo "none"
        fi
    elif docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$GREEN_CONTAINER.*Up"; then
        echo "green"
    else
        echo "none"
    fi
}

# Function to deploy to inactive environment
deploy_to_inactive() {
    local active=$(get_active_environment)
    local target=""
    local target_port=""
    local target_container=""
    
    if [ "$active" = "blue" ] || [ "$active" = "none" ]; then
        target="green"
        target_port="$GREEN_PORT"
        target_container="$GREEN_CONTAINER"
    else
        target="blue"
        target_port="$BLUE_PORT"
        target_container="$BLUE_CONTAINER"
    fi
    
    log "${CYAN}Deploying to $target environment (port $target_port)${NC}"
    log "Current active environment: $active"
    log "Target environment: $target"
    
    # Stop and remove existing target container
    log "${BLUE}Stopping existing $target container...${NC}"
    docker stop "$target_container" 2>/dev/null || true
    docker rm "$target_container" 2>/dev/null || true
    
    # Build new image with timestamp tag
    local image_tag="tgdmemory:$(date +%Y%m%d_%H%M%S)"
    log "${BLUE}Building new image: $image_tag${NC}"
    
    if ! docker build -t "$image_tag" -t "tgdmemory:latest-$target" "$SCRIPT_DIR"; then
        log "${RED}✗ Failed to build Docker image${NC}"
        return 1
    fi
    
    # Create new container with target configuration
    log "${BLUE}Starting new $target container...${NC}"
    
    docker run -d \
        --name "$target_container" \
        --restart unless-stopped \
        -p "$target_port:3000" \
        -e "NODE_ENV=production" \
        -e "PORT=3000" \
        -e "MONGODB_URI=${MONGODB_URI}" \
        -e "OPENAI_API_KEY=${OPENAI_API_KEY}" \
        -e "GOOGLE_API_KEY=${GOOGLE_API_KEY}" \
        -e "JWT_SECRET=${JWT_SECRET}" \
        -v "tgdmemory-logs-$target:/app/server/logs" \
        -v "tgdmemory-cache-$target:/app/server/explanations-cache" \
        "$image_tag"
    
    if [ $? -ne 0 ]; then
        log "${RED}✗ Failed to start $target container${NC}"
        return 1
    fi
    
    # Wait for service to be ready
    log "${BLUE}Waiting for $target environment to be ready...${NC}"
    
    if ! check_service_health "$target_port" "$HEALTH_CHECK_TIMEOUT"; then
        log "${RED}✗ $target environment failed to become healthy${NC}"
        
        # Cleanup failed deployment
        docker stop "$target_container" 2>/dev/null
        docker rm "$target_container" 2>/dev/null
        return 1
    fi
    
    log "${GREEN}✓ $target environment is ready for traffic${NC}"
    echo "$target"
    return 0
}

# Function to switch traffic to new environment
switch_traffic() {
    local target="$1"
    local target_port=""
    
    if [ "$target" = "blue" ]; then
        target_port="$BLUE_PORT"
    else
        target_port="$GREEN_PORT"
    fi
    
    log "${CYAN}Switching traffic to $target environment${NC}"
    
    # Create or update nginx configuration for proxy
    cat > "/tmp/nginx_upstream_$target.conf" << EOF
upstream tgdmemory_backend {
    server localhost:$target_port;
}

server {
    listen $PROXY_PORT;
    server_name localhost;
    
    location / {
        proxy_pass http://tgdmemory_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Health checks
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # If using Docker nginx proxy
    if docker ps | grep -q "$PROXY_CONTAINER"; then
        log "${BLUE}Updating nginx proxy configuration...${NC}"
        
        # Update nginx configuration in proxy container
        docker exec "$PROXY_CONTAINER" bash -c "
            echo 'upstream backend { server host.docker.internal:$target_port; }' > /etc/nginx/conf.d/upstream.conf &&
            nginx -s reload
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            log "${GREEN}✓ Nginx proxy updated to route to $target environment${NC}"
        else
            log "${YELLOW}⚠ Nginx proxy update failed, using direct port routing${NC}"
        fi
    fi
    
    # Save current active environment
    echo "$target" > "/tmp/current_upstream"
    
    # Final health check through proxy
    sleep 2
    if curl -sf "http://localhost:$PROXY_PORT/api/ping" >/dev/null 2>&1; then
        log "${GREEN}✓ Traffic successfully switched to $target environment${NC}"
        return 0
    else
        log "${RED}✗ Failed to verify traffic switch to $target environment${NC}"
        return 1
    fi
}

# Function to cleanup old environment
cleanup_old_environment() {
    local active="$1"
    local old_container=""
    
    if [ "$active" = "blue" ]; then
        old_container="$GREEN_CONTAINER"
    else
        old_container="$BLUE_CONTAINER"
    fi
    
    log "${BLUE}Cleaning up old environment ($old_container)...${NC}"
    
    # Stop old container
    if docker ps | grep -q "$old_container"; then
        docker stop "$old_container" 2>/dev/null || true
        log "${GREEN}✓ Stopped old container: $old_container${NC}"
    fi
    
    # Note: We don't remove the container or volumes immediately
    # to allow for quick rollback if needed
    log "${YELLOW}ℹ Old container stopped but preserved for rollback${NC}"
}

# Function to rollback deployment
rollback() {
    local current=$(get_active_environment)
    local rollback_target=""
    local rollback_container=""
    
    if [ "$current" = "blue" ]; then
        rollback_target="green"
        rollback_container="$GREEN_CONTAINER"
    else
        rollback_target="blue"
        rollback_container="$BLUE_CONTAINER"
    fi
    
    log "${YELLOW}Rolling back from $current to $rollback_target environment${NC}"
    
    # Check if rollback target exists and can be started
    if docker ps -a | grep -q "$rollback_container"; then
        log "${BLUE}Starting rollback environment: $rollback_container${NC}"
        
        if docker start "$rollback_container" >/dev/null 2>&1; then
            # Wait for it to be healthy
            local rollback_port=""
            if [ "$rollback_target" = "blue" ]; then
                rollback_port="$BLUE_PORT"
            else
                rollback_port="$GREEN_PORT"
            fi
            
            if check_service_health "$rollback_port" 30; then
                # Switch traffic back
                if switch_traffic "$rollback_target"; then
                    log "${GREEN}✓ Rollback completed successfully${NC}"
                    return 0
                fi
            fi
        fi
    fi
    
    log "${RED}✗ Rollback failed - no healthy rollback environment available${NC}"
    return 1
}

# Function to show deployment status
show_status() {
    log "${BLUE}Blue-Green Deployment Status${NC}"
    log "============================="
    
    local active=$(get_active_environment)
    log "Active environment: ${GREEN}$active${NC}"
    
    # Check blue environment
    if docker ps | grep -q "$BLUE_CONTAINER"; then
        local blue_status="${GREEN}Running${NC}"
        if check_service_health "$BLUE_PORT" 5; then
            blue_status="$blue_status ${GREEN}(Healthy)${NC}"
        else
            blue_status="$blue_status ${RED}(Unhealthy)${NC}"
        fi
    else
        blue_status="${RED}Stopped${NC}"
    fi
    
    # Check green environment
    if docker ps | grep -q "$GREEN_CONTAINER"; then
        local green_status="${GREEN}Running${NC}"
        if check_service_health "$GREEN_PORT" 5; then
            green_status="$green_status ${GREEN}(Healthy)${NC}"
        else
            green_status="$green_status ${RED}(Unhealthy)${NC}"
        fi
    else
        green_status="${RED}Stopped${NC}"
    fi
    
    log "Blue environment (port $BLUE_PORT): $blue_status"
    log "Green environment (port $GREEN_PORT): $green_status"
    
    # Check proxy status
    if docker ps | grep -q "$PROXY_CONTAINER"; then
        log "Proxy container: ${GREEN}Running${NC}"
    else
        log "Proxy container: ${RED}Stopped${NC}"
    fi
    
    log "\nContainer Images:"
    docker images | grep tgdmemory | head -5
}

# Main deployment function
deploy() {
    log "${CYAN}Starting Blue-Green Deployment${NC}"
    log "================================"
    log "Timestamp: $(date)"
    
    # Pre-deployment checks
    log "${BLUE}Running pre-deployment checks...${NC}"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log "${RED}✗ Docker is not running${NC}"
        return 1
    fi
    
    # Check for required environment variables
    if [ -z "$MONGODB_URI" ]; then
        log "${RED}✗ MONGODB_URI not set${NC}"
        return 1
    fi
    
    # Run tests before deployment
    log "${BLUE}Running pre-deployment tests...${NC}"
    if [ -f "$SCRIPT_DIR/test_production.sh" ]; then
        if ! "$SCRIPT_DIR/test_production.sh"; then
            log "${RED}✗ Pre-deployment tests failed${NC}"
            return 1
        fi
    fi
    
    # Deploy to inactive environment
    local new_env=$(deploy_to_inactive)
    if [ $? -ne 0 ]; then
        log "${RED}✗ Deployment failed${NC}"
        return 1
    fi
    
    # Run post-deployment tests on new environment
    log "${BLUE}Running post-deployment tests on $new_env environment...${NC}"
    
    local test_port=""
    if [ "$new_env" = "blue" ]; then
        test_port="$BLUE_PORT"
    else
        test_port="$GREEN_PORT"
    fi
    
    if [ -f "$SCRIPT_DIR/test_production.sh" ]; then
        if ! TEST_PORT="$test_port" "$SCRIPT_DIR/test_production.sh"; then
            log "${RED}✗ Post-deployment tests failed on $new_env environment${NC}"
            
            # Cleanup failed deployment
            if [ "$new_env" = "blue" ]; then
                docker stop "$BLUE_CONTAINER" 2>/dev/null
            else
                docker stop "$GREEN_CONTAINER" 2>/dev/null
            fi
            
            return 1
        fi
    fi
    
    # Switch traffic to new environment
    if ! switch_traffic "$new_env"; then
        log "${RED}✗ Failed to switch traffic to $new_env environment${NC}"
        return 1
    fi
    
    # Cleanup old environment
    cleanup_old_environment "$new_env"
    
    log "${GREEN}🎉 Blue-Green deployment completed successfully!${NC}"
    log "New active environment: $new_env"
    log "Application is available at: http://localhost:$PROXY_PORT"
    
    return 0
}

# Main function
main() {
    local command="$1"
    shift
    
    case "$command" in
        "deploy")
            deploy "$@"
            ;;
        "rollback")
            rollback "$@"
            ;;
        "status")
            show_status "$@"
            ;;
        "switch")
            local target="$1"
            if [ "$target" != "blue" ] && [ "$target" != "green" ]; then
                echo "Usage: $0 switch {blue|green}"
                exit 1
            fi
            switch_traffic "$target"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|switch} [options]"
            echo ""
            echo "Commands:"
            echo "  deploy    Deploy new version using blue-green strategy"
            echo "  rollback  Rollback to previous environment"
            echo "  status    Show current deployment status"
            echo "  switch    Manually switch traffic between environments"
            echo ""
            echo "Examples:"
            echo "  $0 deploy"
            echo "  $0 rollback"
            echo "  $0 status"
            echo "  $0 switch blue"
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
