#!/bin/bash

# TGD Memory Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tgdmemory"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f ".env.production" ]]; then
            log_info "Copying .env.production to $ENV_FILE"
            cp .env.production "$ENV_FILE"
            log_warning "Please review and update the $ENV_FILE file with your actual configuration"
        else
            log_error "$ENV_FILE file not found. Please create it from .env.production template"
            exit 1
        fi
    fi
    
    log_success "Environment setup complete"
}

# Generate SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [[ -f "./nginx/ssl/cert.pem" && -f "./nginx/ssl/key.pem" ]]; then
        log_info "SSL certificates already exist"
    else
        if [[ -x "./generate-ssl-certs.sh" ]]; then
            ./generate-ssl-certs.sh
        else
            log_warning "SSL certificate generation script not found or not executable"
            log_warning "Please generate SSL certificates manually"
        fi
    fi
    
    log_success "SSL setup complete"
}

# Build and deploy
deploy() {
    log_info "Building and deploying $PROJECT_NAME..."
    
    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose pull mongodb nginx
    
    # Build the application
    log_info "Building application..."
    docker-compose build --no-cache app
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
    
    log_success "Deployment complete"
}

# Start nginx (optional)
start_nginx() {
    if [[ "$1" == "--with-nginx" ]]; then
        log_info "Starting nginx reverse proxy..."
        docker-compose --profile nginx up -d nginx
        log_success "Nginx started"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if app is responding
    if curl -f http://localhost:3000/api/ping &> /dev/null; then
        log_success "Application is healthy"
    else
        log_error "Application health check failed"
        exit 1
    fi
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup database
    docker-compose exec -T mongodb mongodump --out /tmp/backup
    docker-compose exec -T mongodb tar -czf /tmp/backup.tar.gz -C /tmp backup
    docker cp $(docker-compose ps -q mongodb):/tmp/backup.tar.gz "$BACKUP_FILE"
    
    log_success "Backup created: $BACKUP_FILE"
}

# Display status
show_status() {
    log_info "Current status:"
    docker-compose ps
    echo
    log_info "Application logs (last 20 lines):"
    docker-compose logs --tail=20 app
}

# Main execution
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} TGD Memory Production Deployment${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            setup_environment
            setup_ssl
            deploy
            start_nginx "$2"
            health_check
            show_status
            log_success "Deployment successful! 🎉"
            echo
            log_info "Access your application at:"
            log_info "  HTTP:  http://localhost:3000"
            log_info "  HTTPS: https://localhost (if nginx is enabled)"
            ;;
        "backup")
            create_backup
            ;;
        "status")
            show_status
            ;;
        "logs")
            docker-compose logs -f "${2:-app}"
            ;;
        "stop")
            log_info "Stopping services..."
            docker-compose down
            log_success "Services stopped"
            ;;
        "restart")
            log_info "Restarting services..."
            docker-compose restart
            log_success "Services restarted"
            ;;
        "clean")
            log_warning "This will remove all containers, volumes, and images!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose down -v --rmi all
                log_success "Cleanup complete"
            fi
            ;;
        *)
            echo "Usage: $0 {deploy|backup|status|logs|stop|restart|clean}"
            echo
            echo "Commands:"
            echo "  deploy [--with-nginx]  Deploy the application (optionally with nginx)"
            echo "  backup                 Create database backup"
            echo "  status                 Show current status"
            echo "  logs [service]         Show logs for service (default: app)"
            echo "  stop                   Stop all services"
            echo "  restart                Restart all services"
            echo "  clean                  Remove all containers, volumes, and images"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
