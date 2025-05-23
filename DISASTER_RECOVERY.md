# Disaster Recovery Procedures for TGD Memory

This document outlines comprehensive disaster recovery procedures for the TGD Memory application, covering various failure scenarios and recovery strategies.

## Table of Contents

1. [Overview](#overview)
2. [Contact Information](#contact-information)
3. [Backup and Recovery Strategy](#backup-and-recovery-strategy)
4. [Failure Scenarios](#failure-scenarios)
5. [Recovery Procedures](#recovery-procedures)
6. [Testing and Validation](#testing-and-validation)
7. [Post-Recovery Checklist](#post-recovery-checklist)

## Overview

### Recovery Time Objectives (RTO)
- **Critical Services**: 15 minutes
- **Full Application**: 30 minutes
- **Complete System Rebuild**: 2 hours

### Recovery Point Objectives (RPO)
- **Database**: 15 minutes (automated backups)
- **Application Cache**: 1 hour (acceptable loss)
- **Configuration**: Real-time (version controlled)

### Service Priority
1. **Critical**: Database, Authentication, Core API
2. **High**: Explanation generation, User management
3. **Medium**: Cache, Static content
4. **Low**: Monitoring, Logs

## Contact Information

### Emergency Contacts
```
Primary Administrator: [Your Name]
Email: [your.email@domain.com]
Phone: [+1-xxx-xxx-xxxx]

Secondary Contact: [Backup Admin]
Email: [backup@domain.com]
Phone: [+1-xxx-xxx-xxxx]

Hosting Provider: [Provider Name]
Support: [support@provider.com]
Emergency: [emergency@provider.com]
```

### Service Accounts
- MongoDB Atlas/Cloud Provider
- OpenAI API
- Google AI API
- Domain Registrar
- SSL Certificate Provider

## Backup and Recovery Strategy

### Automated Backups

#### Database Backups
```bash
# Daily automated backup (configured in backup.sh)
- Schedule: Every 6 hours
- Retention: 30 days
- Location: ./backups/mongodb/
- Verification: Automated restore test weekly
```

#### Application Backups
```bash
# Application and configuration backup
- Schedule: Daily
- Retention: 14 days
- Location: ./backups/application/
- Contents: Source code, configuration, cache
```

#### Container Images
```bash
# Docker image backup
- Strategy: Tag and push to registry
- Retention: Last 10 versions
- Location: Docker Hub/Private Registry
```

### Manual Backup Procedures

#### Emergency Database Backup
```bash
# Create immediate backup
./backup.sh --emergency

# Or manual mongodump
mongodump --uri="$MONGODB_URI" --out="emergency-backup-$(date +%Y%m%d_%H%M%S)"
```

#### Configuration Backup
```bash
# Backup all configuration files
tar -czf "config-backup-$(date +%Y%m%d_%H%M%S).tar.gz" \
  .env* \
  ecosystem.config.js \
  docker-compose.yml \
  nginx/nginx.conf \
  package*.json
```

## Failure Scenarios

### Scenario 1: Application Server Failure

**Symptoms:**
- HTTP 5xx errors
- Health checks failing
- PM2/Docker container stopped

**Immediate Actions:**
1. Check server logs: `pm2 logs` or `docker logs tgdmemory`
2. Verify system resources: `top`, `df -h`
3. Check process status: `pm2 status` or `docker ps`

**Recovery Steps:**
```bash
# Restart PM2 process
pm2 restart tgdmemory-server

# Or restart Docker container
docker restart tgdmemory

# If restart fails, redeploy
./deploy_production.sh

# For blue-green deployment
./blue_green_deploy.sh deploy
```

### Scenario 2: Database Connection Failure

**Symptoms:**
- Database connection errors in logs
- API endpoints returning 500 errors
- Health check shows MongoDB disconnected

**Immediate Actions:**
1. Check MongoDB service status
2. Verify network connectivity
3. Check connection string and credentials

**Recovery Steps:**
```bash
# Check MongoDB status (if self-hosted)
sudo systemctl status mongod
sudo systemctl restart mongod

# For MongoDB Atlas, check dashboard
# Verify MONGODB_URI in environment

# Test connection
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"

# Restart application after DB is available
pm2 restart tgdmemory-server
```

### Scenario 3: Complete Database Loss

**Symptoms:**
- Database completely inaccessible
- Data corruption detected
- Cloud provider database deleted

**Recovery Steps:**
```bash
# 1. Stop all application instances
pm2 stop all
docker stop tgdmemory

# 2. Create new database instance
# (Follow MongoDB setup procedures)

# 3. Restore from latest backup
./backup.sh --restore [backup-file]

# 4. Verify data integrity
mongosh "$MONGODB_URI" --eval "
  db.users.countDocuments();
  db.comments.countDocuments();
  db.runCommand({collStats: 'users'});
"

# 5. Update connection strings if needed
# Edit .env file with new MONGODB_URI

# 6. Restart application
pm2 start ecosystem.config.js
```

### Scenario 4: Complete Server/Infrastructure Loss

**Symptoms:**
- Server completely inaccessible
- Hosting provider outage
- Natural disaster affecting data center

**Recovery Steps:**
```bash
# 1. Provision new server/infrastructure
# (Use infrastructure as code if available)

# 2. Clone repository
git clone https://github.com/[username]/tgdmemory.git
cd tgdmemory

# 3. Restore environment configuration
# Copy backed up .env files

# 4. Restore database
# Create new MongoDB instance
# Restore from backup (see Scenario 3)

# 5. Deploy application
./init.sh
./deploy_production.sh

# 6. Update DNS records
# Point domain to new server IP

# 7. Update SSL certificates
# Follow SSL_HTTPS_GUIDE.md procedures
```

### Scenario 5: Security Breach

**Symptoms:**
- Unauthorized access detected
- Suspicious database modifications
- Malicious code injection

**Immediate Actions:**
```bash
# 1. Isolate the system
sudo ufw deny incoming
docker stop tgdmemory

# 2. Preserve evidence
cp -r /var/log/tgdmemory /tmp/incident-logs-$(date +%Y%m%d_%H%M%S)
./backup.sh --emergency

# 3. Change all credentials
# Update .env with new API keys, database passwords
# Rotate JWT secrets
# Change admin passwords
```

**Recovery Steps:**
```bash
# 1. Rebuild from clean state
git clone [repository] tgdmemory-clean
cd tgdmemory-clean

# 2. Scan for vulnerabilities
npm audit
docker run --rm -v "$PWD:/app" aquasec/trivy fs /app

# 3. Restore data from backup (before breach)
# Carefully examine backup for integrity

# 4. Deploy with enhanced security
# Update all dependencies
# Review and tighten security configurations

# 5. Monitor closely for 48-72 hours
./monitor.sh --alert-level high
```

## Recovery Procedures

### Quick Recovery Checklist

#### 5-Minute Assessment
- [ ] Check application health: `curl http://localhost:3000/api/health`
- [ ] Check process status: `pm2 status` or `docker ps`
- [ ] Check database: `mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"`
- [ ] Check disk space: `df -h`
- [ ] Check system load: `top`

#### 15-Minute Recovery
- [ ] Review recent logs: `tail -f server/logs/error.log`
- [ ] Restart services: `pm2 restart all`
- [ ] Clear caches if needed: `./clean_caches.sh`
- [ ] Run basic tests: `./test_production.sh`
- [ ] Verify health endpoints: `/api/ping`, `/api/health`

#### 30-Minute Full Recovery
- [ ] Create backup before changes: `./backup.sh`
- [ ] Deploy fresh version: `./deploy_production.sh`
- [ ] Run migration scripts: `./migrate.sh up`
- [ ] Comprehensive testing: `./test_production.sh`
- [ ] Performance verification: `./performance_monitor.sh`

### Environment Recovery

#### Development Environment
```bash
# Quick development reset
git pull origin main
npm install
cd server && npm install
cp .env.example .env
# Edit .env with development credentials
npm run dev
```

#### Staging Environment
```bash
# Staging environment recovery
git checkout main
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up --build -d
./test_production.sh
```

#### Production Environment
```bash
# Production recovery with zero downtime
./blue_green_deploy.sh deploy

# Or traditional deployment
./backup.sh
./deploy_production.sh
./test_production.sh
```

## Testing and Validation

### Recovery Testing Schedule

#### Monthly Tests
- [ ] Backup restoration test
- [ ] Application restart procedures
- [ ] Database failover (if applicable)
- [ ] Security credential rotation

#### Quarterly Tests
- [ ] Complete server rebuild simulation
- [ ] Disaster recovery full simulation
- [ ] Security breach response drill
- [ ] Documentation review and update

#### Annual Tests
- [ ] Complete infrastructure recreation
- [ ] Multi-region failover (if applicable)
- [ ] Vendor/provider change simulation
- [ ] Business continuity plan validation

### Validation Checklist

#### Post-Recovery Verification
```bash
# 1. Application functionality
curl -f http://localhost:3000/api/health
curl -f http://localhost:3000/api/ping

# 2. Database integrity
./migrate.sh status
mongosh "$MONGODB_URI" --eval "db.users.countDocuments()"

# 3. API endpoints
curl -X POST -H "Content-Type: application/json" \
  -d '{"latex": "E=mc^2", "title": "Test"}' \
  http://localhost:3000/api/explain

# 4. Authentication
curl -X POST -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}' \
  http://localhost:3000/api/login

# 5. Performance
./performance_monitor.sh
```

#### Data Integrity Verification
```bash
# Database consistency checks
mongosh "$MONGODB_URI" --eval "
  // Check for orphaned records
  db.comments.aggregate([
    {\$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'user'}},
    {\$match: {user: {\$size: 0}}}
  ]).toArray();
  
  // Verify indexes
  db.users.getIndexes();
  db.comments.getIndexes();
"
```

## Post-Recovery Checklist

### Immediate Actions (0-1 hour)
- [ ] Verify all services are running
- [ ] Check application health endpoints
- [ ] Test critical user journeys
- [ ] Monitor error logs for 30 minutes
- [ ] Notify stakeholders of recovery

### Short-term Actions (1-24 hours)
- [ ] Performance monitoring and optimization
- [ ] Security scan and vulnerability assessment
- [ ] Backup verification and scheduling
- [ ] Documentation updates
- [ ] Root cause analysis initiation

### Long-term Actions (1-7 days)
- [ ] Complete root cause analysis
- [ ] Update disaster recovery procedures
- [ ] Implement preventive measures
- [ ] Team training and knowledge sharing
- [ ] Vendor/provider relationship review

### Communication Plan

#### During Incident
1. **Internal notification**: Development team, administrators
2. **Stakeholder update**: Management, key users
3. **Status page update**: If public-facing
4. **Regular progress updates**: Every 30 minutes during active recovery

#### Post-Recovery
1. **Recovery confirmation**: All stakeholders
2. **Incident report**: Root cause, timeline, lessons learned
3. **Process improvements**: Update procedures and documentation
4. **Training updates**: Refresh team knowledge

## Contact and Escalation Matrix

### Level 1 - Application Issues
- **Contact**: Primary Developer
- **Response Time**: 15 minutes
- **Authority**: Restart services, deploy fixes

### Level 2 - Infrastructure Issues
- **Contact**: System Administrator
- **Response Time**: 30 minutes
- **Authority**: Server management, infrastructure changes

### Level 3 - Major Outage
- **Contact**: Management + All Technical Staff
- **Response Time**: 1 hour
- **Authority**: Budget approval for emergency resources

### Level 4 - Business Continuity
- **Contact**: Executive Team
- **Response Time**: 2 hours
- **Authority**: Major business decisions, vendor changes

---

## Emergency Contact Card

**Print and keep accessible:**

```
TGD Memory Emergency Recovery
============================
Application URL: http://[domain]:3000
Health Check: /api/health

Quick Commands:
- Restart: pm2 restart tgdmemory-server
- Logs: pm2 logs tgdmemory-server
- Deploy: ./deploy_production.sh
- Backup: ./backup.sh
- Test: ./test_production.sh

Emergency Contacts:
- Primary: [Your Phone]
- Secondary: [Backup Phone]
- Hosting: [Provider Support]

Database: MongoDB [Connection Details]
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-05-23  
**Next Review**: 2025-08-23  
**Owner**: TGD Memory Development Team
