# Rate Limiting Implementation Guide

This document provides details about the rate limiting implementation in the TGD Memory application.

## Overview

Rate limiting is implemented to protect the application from abuse, excessive requests, and potential DoS attacks. The implementation uses the `express-rate-limit` middleware for Node.js Express applications.

## Current Configuration

### API Rate Limiting

A general rate limiter is applied to all API routes at `/api/*`:

```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production, 1000 in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
  skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for OPTIONS (preflight) requests
});
```

### Authentication Rate Limiting

A stricter rate limiter is applied to authentication endpoints to help prevent brute force attacks:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 50, // Limit each IP to 5 auth attempts per windowMs in production, 50 in development
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});
```

This limiter is applied to the following authentication endpoints:
- `/api/auth/register`
- `/api/auth/login`

## Proxy Configuration

Since the application is deployed in Docker containers with an Nginx reverse proxy, the Express application is configured to trust proxy headers:

```javascript
// Configure Express to trust proxy
app.set('trust proxy', 1);
```

This ensures that client IP addresses are correctly identified from the `X-Forwarded-For` header provided by the reverse proxy.

## Nginx Configuration

The Nginx configuration includes its own rate limiting for an additional layer of protection:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
```

Nginx properly sets the `X-Forwarded-For` header in the proxy configuration:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## Testing Rate Limiting

Use the provided `test_rate_limiting.sh` script to test rate limiting functionality:

```bash
./test_rate_limiting.sh
```

This script tests:
1. API rate limiting on the `/api/ping` endpoint (using the test limiter with 5 requests/minute limit)
2. Authentication rate limiting on the `/api/auth/login` endpoint
3. Proper handling of `X-Forwarded-For` headers

### Test Rate Limiting

A special rate limiter with lower thresholds is implemented for testing purposes:

```javascript
const testLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  message: {
    error: 'Rate limit reached during testing.',
    retryAfter: 60 // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});
```

This limiter is applied to the `/api/ping` endpoint specifically for easier rate limiting testing.

## Notes on Tuning

Depending on your application's traffic patterns, you may need to adjust the rate limit parameters:

- For high-traffic applications: Increase the `max` value for the API limiter
- For more sensitive endpoints: Decrease the `max` value and possibly the `windowMs` for stricter limits
- For clustered deployments: Consider using a Redis store instead of the default memory store for rate limiting coordination across multiple instances

## Monitoring and Alerts

Monitor rate limit hits to detect potential attacks. Consider implementing alerts for:
- Sudden spikes in rate limit hits
- Persistent rate limit hits from specific IP addresses or ranges

Logging of rate limit events can be found in the application logs.
