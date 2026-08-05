# ── Stage 1: Build the React client ──────────────────────────────────
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Install dependencies first (better layer caching)
COPY client/package.json client/package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy client source and build
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────────────
FROM node:18-alpine AS production

# Add metadata
LABEL maintainer="Samridhi Enterprises"
LABEL description="Samridhi Enterprises - Vehicle Spare Parts E-Commerce API"

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install server dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy server source
COPY server/ ./

# Copy shared constants (used by both client and server)
COPY shared/ ../shared/

# Copy built client assets from Stage 1
COPY --from=client-build /app/client/dist ./public

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER appuser

# Expose the server port
EXPOSE 5000

# Health check — pings the root endpoint every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start the server
CMD ["node", "index.js"]
