# SSL/HTTPS Configuration Guide for TGD Memory

## Overview
This guide covers setting up SSL/HTTPS for the TGD Memory application in production.

## Option 1: Let's Encrypt with Certbot (Recommended)

### Prerequisites
- Domain name pointing to your server
- Nginx installed and configured
- Port 80 and 443 open in firewall

### Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### Certificate Generation
```bash
# Generate certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Auto-renewal Setup
```bash
# Add to crontab
sudo crontab -e

# Add this line for automatic renewal (runs twice daily)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Option 2: Self-Signed Certificate (Development/Testing)

### Generate Self-Signed Certificate
```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate private key
sudo openssl genrsa -out /etc/nginx/ssl/private.key 2048

# Generate certificate
sudo openssl req -new -x509 -key /etc/nginx/ssl/private.key -out /etc/nginx/ssl/certificate.crt -days 365

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/private.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

## Option 3: Custom Certificate

### If you have your own certificate files:
```bash
# Copy your certificate files
sudo cp your-certificate.crt /etc/nginx/ssl/certificate.crt
sudo cp your-private-key.key /etc/nginx/ssl/private.key

# Set permissions
sudo chmod 600 /etc/nginx/ssl/private.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

## Nginx HTTPS Configuration

Update your nginx configuration (`nginx/nginx.conf`):

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    # SSL Session Settings
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling (if using Let's Encrypt)
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/certificate.crt;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Your existing location blocks...
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://tgdmemory_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://tgdmemory_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://tgdmemory_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Configuration

Update your `.env` file:
```bash
# HTTPS Configuration
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/certificate.crt
SSL_KEY_PATH=/etc/nginx/ssl/private.key

# Update CORS origins for HTTPS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Testing SSL Configuration

### Test SSL Certificate
```bash
# Test certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

### Online SSL Testing Tools
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [SSL Checker](https://www.sslchecker.com/)

## Docker SSL Configuration

If using Docker, mount SSL certificates:

```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
```

## Security Best Practices

1. **Regular Updates**: Keep certificates up to date
2. **Strong Ciphers**: Use modern TLS versions (1.2+)
3. **HSTS**: Enable HTTP Strict Transport Security
4. **Certificate Monitoring**: Monitor certificate expiration
5. **Rate Limiting**: Implement rate limiting on HTTPS endpoints

## Troubleshooting

### Common Issues

1. **Certificate Chain Issues**
   ```bash
   # Check certificate chain
   openssl s_client -connect yourdomain.com:443 -showcerts
   ```

2. **Permission Issues**
   ```bash
   # Fix SSL file permissions
   sudo chmod 600 /etc/nginx/ssl/private.key
   sudo chmod 644 /etc/nginx/ssl/certificate.crt
   sudo chown root:root /etc/nginx/ssl/*
   ```

3. **Nginx Configuration Test**
   ```bash
   # Test nginx configuration
   sudo nginx -t
   
   # Reload nginx
   sudo systemctl reload nginx
   ```

## Monitoring SSL

### Certificate Expiration Monitoring Script
```bash
#!/bin/bash
# ssl-monitor.sh

DOMAIN="yourdomain.com"
THRESHOLD_DAYS=30

EXPIRY_DATE=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $THRESHOLD_DAYS ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $DAYS_LEFT days"
    # Send alert (email, webhook, etc.)
fi
```

## Advanced Configuration

### HTTP/2 Push (Optional)
```nginx
# Enable HTTP/2 server push for critical resources
location / {
    http2_push /assets/css/main.css;
    http2_push /assets/js/main.js;
    proxy_pass http://tgdmemory_app;
}
```

### SSL Session Resumption
```nginx
# Optimize SSL session resumption
ssl_session_cache shared:SSL:20m;
ssl_session_timeout 10m;
ssl_buffer_size 8k;
```

This guide provides comprehensive SSL/HTTPS setup options for the TGD Memory application. Choose the option that best fits your production environment and security requirements.
