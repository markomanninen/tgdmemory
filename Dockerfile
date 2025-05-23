# Multi-stage Docker build for TGD Memory application
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend build
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy frontend package files first for better layer caching
COPY package*.json ./
COPY vite.config.js ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY App.jsx ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Set environment for production build
ENV NODE_ENV=production

# Build frontend for production
RUN npm run build:prod

# Backend stage
FROM node:18-alpine AS backend

# Install runtime dependencies and dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy server package files first for better layer caching
COPY server/package*.json ./server/

# Install production dependencies only
RUN cd server && npm ci --only=production --no-audit --no-fund

# Copy server source code
COPY server/ ./server/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./public

# Create logs directory and set permissions
RUN mkdir -p /app/server/logs && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/ping', (res) => { res.statusCode === 200 ? process.exit(0) : process.exit(1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/server.js"]
