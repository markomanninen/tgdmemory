#!/bin/bash

# Database migration script for TGD Memory application
# Handles database schema updates and data migrations safely

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
MIGRATION_LOG="$SCRIPT_DIR/migration.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
fi

# Ensure migrations directory exists
mkdir -p "$MIGRATIONS_DIR"

# Logging function
log() {
    echo -e "$1" | tee -a "$MIGRATION_LOG"
}

# Function to check MongoDB connection
check_mongodb_connection() {
    log "${BLUE}Checking MongoDB connection...${NC}"
    
    if [ -z "$MONGODB_URI" ]; then
        log "${RED}ERROR: MONGODB_URI not set in environment${NC}"
        return 1
    fi
    
    # Test connection using mongosh or mongo client
    if command -v mongosh >/dev/null 2>&1; then
        if mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            log "${GREEN}✓ MongoDB connection successful${NC}"
            return 0
        else
            log "${RED}✗ MongoDB connection failed${NC}"
            return 1
        fi
    elif command -v mongo >/dev/null 2>&1; then
        if mongo "$MONGODB_URI" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            log "${GREEN}✓ MongoDB connection successful${NC}"
            return 0
        else
            log "${RED}✗ MongoDB connection failed${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠ MongoDB client not found, skipping connection test${NC}"
        return 0
    fi
}

# Function to create a new migration
create_migration() {
    local name="$1"
    
    if [ -z "$name" ]; then
        echo "Usage: $0 create <migration_name>"
        exit 1
    fi
    
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local migration_file="$MIGRATIONS_DIR/${timestamp}_${name}.js"
    
    cat > "$migration_file" << EOF
// Migration: $name
// Created: $(date)
// Description: Add description of what this migration does

const { MongoClient } = require('mongodb');

async function up(db) {
    console.log('Running migration: $name (up)');
    
    // Add your migration logic here
    // Example:
    // await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // await db.collection('comments').updateMany({}, { \$set: { version: 2 } });
    
    console.log('Migration $name completed successfully');
}

async function down(db) {
    console.log('Rolling back migration: $name (down)');
    
    // Add your rollback logic here
    // Example:
    // await db.collection('users').dropIndex({ email: 1 });
    // await db.collection('comments').updateMany({}, { \$unset: { version: 1 } });
    
    console.log('Rollback $name completed successfully');
}

module.exports = { up, down };
EOF
    
    log "${GREEN}Created migration: $migration_file${NC}"
    log "Please edit the migration file to add your migration logic."
}

# Function to get applied migrations
get_applied_migrations() {
    local applied_file="$SCRIPT_DIR/.migrations_applied"
    
    if [ -f "$applied_file" ]; then
        cat "$applied_file"
    fi
}

# Function to mark migration as applied
mark_migration_applied() {
    local migration="$1"
    local applied_file="$SCRIPT_DIR/.migrations_applied"
    
    echo "$migration" >> "$applied_file"
}

# Function to remove migration from applied list
remove_migration_applied() {
    local migration="$1"
    local applied_file="$SCRIPT_DIR/.migrations_applied"
    
    if [ -f "$applied_file" ]; then
        grep -v "^$migration$" "$applied_file" > "$applied_file.tmp" && mv "$applied_file.tmp" "$applied_file"
    fi
}

# Function to run migrations
run_migrations() {
    local direction="${1:-up}"
    
    log "${BLUE}Running database migrations ($direction)...${NC}"
    log "Timestamp: $(date)"
    
    if ! check_mongodb_connection; then
        log "${RED}Cannot proceed without MongoDB connection${NC}"
        return 1
    fi
    
    # Get list of migration files
    local migration_files=($(find "$MIGRATIONS_DIR" -name "*.js" | sort))
    local applied_migrations=($(get_applied_migrations))
    
    if [ ${#migration_files[@]} -eq 0 ]; then
        log "${YELLOW}No migration files found in $MIGRATIONS_DIR${NC}"
        return 0
    fi
    
    local success_count=0
    local error_count=0
    
    if [ "$direction" = "up" ]; then
        # Run pending migrations
        for migration_file in "${migration_files[@]}"; do
            local migration_name=$(basename "$migration_file")
            
            # Check if already applied
            if printf '%s\n' "${applied_migrations[@]}" | grep -q "^$migration_name$"; then
                log "${YELLOW}⏭ Skipping already applied migration: $migration_name${NC}"
                continue
            fi
            
            log "${BLUE}📦 Applying migration: $migration_name${NC}"
            
            # Run the migration using Node.js
            if node -e "
                const migration = require('$migration_file');
                const { MongoClient } = require('mongodb');
                
                (async () => {
                    const client = new MongoClient('$MONGODB_URI');
                    try {
                        await client.connect();
                        const db = client.db();
                        await migration.up(db);
                        console.log('Migration completed successfully');
                    } catch (error) {
                        console.error('Migration failed:', error.message);
                        process.exit(1);
                    } finally {
                        await client.close();
                    }
                })();
            " 2>&1 | tee -a "$MIGRATION_LOG"; then
                mark_migration_applied "$migration_name"
                log "${GREEN}✓ Migration applied successfully: $migration_name${NC}"
                success_count=$((success_count + 1))
            else
                log "${RED}✗ Migration failed: $migration_name${NC}"
                error_count=$((error_count + 1))
                
                # Stop on first error to prevent data corruption
                log "${RED}Stopping migrations due to error${NC}"
                break
            fi
        done
    else
        # Run rollbacks (in reverse order)
        for ((i=${#migration_files[@]}-1; i>=0; i--)); do
            local migration_file="${migration_files[i]}"
            local migration_name=$(basename "$migration_file")
            
            # Check if was applied
            if ! printf '%s\n' "${applied_migrations[@]}" | grep -q "^$migration_name$"; then
                log "${YELLOW}⏭ Skipping non-applied migration: $migration_name${NC}"
                continue
            fi
            
            log "${BLUE}🔄 Rolling back migration: $migration_name${NC}"
            
            # Run the rollback using Node.js
            if node -e "
                const migration = require('$migration_file');
                const { MongoClient } = require('mongodb');
                
                (async () => {
                    const client = new MongoClient('$MONGODB_URI');
                    try {
                        await client.connect();
                        const db = client.db();
                        await migration.down(db);
                        console.log('Rollback completed successfully');
                    } catch (error) {
                        console.error('Rollback failed:', error.message);
                        process.exit(1);
                    } finally {
                        await client.close();
                    }
                })();
            " 2>&1 | tee -a "$MIGRATION_LOG"; then
                remove_migration_applied "$migration_name"
                log "${GREEN}✓ Migration rolled back successfully: $migration_name${NC}"
                success_count=$((success_count + 1))
            else
                log "${RED}✗ Rollback failed: $migration_name${NC}"
                error_count=$((error_count + 1))
                
                # Stop on first error
                log "${RED}Stopping rollbacks due to error${NC}"
                break
            fi
        done
    fi
    
    log "\n${BLUE}Migration Summary${NC}"
    log "=================="
    log "Direction: $direction"
    log "Successful: $success_count"
    log "Failed: $error_count"
    
    if [ $error_count -eq 0 ]; then
        log "${GREEN}All migrations completed successfully${NC}"
        return 0
    else
        log "${RED}Some migrations failed${NC}"
        return 1
    fi
}

# Function to show migration status
show_status() {
    log "${BLUE}Migration Status${NC}"
    log "================"
    
    local migration_files=($(find "$MIGRATIONS_DIR" -name "*.js" | sort))
    local applied_migrations=($(get_applied_migrations))
    
    if [ ${#migration_files[@]} -eq 0 ]; then
        log "${YELLOW}No migration files found${NC}"
        return
    fi
    
    for migration_file in "${migration_files[@]}"; do
        local migration_name=$(basename "$migration_file")
        
        if printf '%s\n' "${applied_migrations[@]}" | grep -q "^$migration_name$"; then
            log "${GREEN}✓ $migration_name (applied)${NC}"
        else
            log "${YELLOW}○ $migration_name (pending)${NC}"
        fi
    done
    
    log "\nTotal migrations: ${#migration_files[@]}"
    log "Applied: ${#applied_migrations[@]}"
    log "Pending: $((${#migration_files[@]} - ${#applied_migrations[@]}))"
}

# Function to backup database before migrations
backup_database() {
    log "${BLUE}Creating database backup...${NC}"
    
    if command -v mongodump >/dev/null 2>&1; then
        local backup_dir="$SCRIPT_DIR/db-backup-$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        if mongodump --uri="$MONGODB_URI" --out="$backup_dir" >/dev/null 2>&1; then
            log "${GREEN}✓ Database backup created: $backup_dir${NC}"
            return 0
        else
            log "${RED}✗ Database backup failed${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠ mongodump not available, skipping backup${NC}"
        return 0
    fi
}

# Main function
main() {
    local command="$1"
    shift
    
    case "$command" in
        "create")
            create_migration "$@"
            ;;
        "up"|"migrate")
            backup_database
            run_migrations "up"
            ;;
        "down"|"rollback")
            backup_database
            run_migrations "down"
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 {create|up|down|status} [options]"
            echo ""
            echo "Commands:"
            echo "  create <name>  Create a new migration file"
            echo "  up|migrate     Run pending migrations"
            echo "  down|rollback  Roll back the last migration"
            echo "  status         Show migration status"
            echo ""
            echo "Examples:"
            echo "  $0 create add_user_indexes"
            echo "  $0 up"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
