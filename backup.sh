#!/bin/bash

# TGD Memory Backup Script
# Automated backup script for database and application data

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/tgdmemory/backups}"
DB_NAME="${MONGO_DB_NAME:-tgdmemory}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
log "Starting database backup..."
DB_BACKUP_DIR="$BACKUP_DIR/db_$TIMESTAMP"
mkdir -p "$DB_BACKUP_DIR"

if command -v mongodump &> /dev/null; then
    mongodump --uri="$MONGO_URI/$DB_NAME" --out="$DB_BACKUP_DIR"
    log "Database backup completed: $DB_BACKUP_DIR"
else
    error "mongodump not found. Please install MongoDB database tools."
fi

# Application data backup
log "Starting application data backup..."
APP_BACKUP_DIR="$BACKUP_DIR/app_$TIMESTAMP"
mkdir -p "$APP_BACKUP_DIR"

# Backup cache files
if [ -d "/opt/tgdmemory/current/public/explanations-cache" ]; then
    cp -r "/opt/tgdmemory/current/public/explanations-cache" "$APP_BACKUP_DIR/"
    log "Cache backup completed"
fi

# Backup logs
if [ -d "/opt/tgdmemory/current/server/logs" ]; then
    cp -r "/opt/tgdmemory/current/server/logs" "$APP_BACKUP_DIR/"
    log "Logs backup completed"
fi

# Backup configuration
if [ -f "/opt/tgdmemory/current/.env" ]; then
    cp "/opt/tgdmemory/current/.env" "$APP_BACKUP_DIR/"
    log "Configuration backup completed"
fi

# Create compressed archive
log "Creating compressed archive..."
cd "$BACKUP_DIR"
tar -czf "tgdmemory_backup_$TIMESTAMP.tar.gz" "db_$TIMESTAMP" "app_$TIMESTAMP"

# Clean up temporary directories
rm -rf "db_$TIMESTAMP" "app_$TIMESTAMP"

log "Backup archive created: tgdmemory_backup_$TIMESTAMP.tar.gz"

# Clean old backups
log "Cleaning old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "tgdmemory_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/tgdmemory_backup_$TIMESTAMP.tar.gz" | cut -f1)
log "Backup completed successfully. Size: $BACKUP_SIZE"

# Optional: Upload to cloud storage
if [ -n "$AWS_S3_BUCKET" ]; then
    if command -v aws &> /dev/null; then
        log "Uploading backup to S3..."
        aws s3 cp "$BACKUP_DIR/tgdmemory_backup_$TIMESTAMP.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
        log "Backup uploaded to S3"
    else
        warning "AWS CLI not found, skipping S3 upload"
    fi
fi

log "Backup process completed"
