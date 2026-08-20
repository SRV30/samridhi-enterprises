# ── Stage 1: Build the React client ──────────────────────────────────
FROM node:18-alpine AS client-build

WORKDIR /app/client
COPY client/package.json ./
RUN npm install --ignore-scripts
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────────────
FROM node:18-alpine AS production

LABEL maintainer="Samridhi Enterprises"
LABEL description="Samridhi Enterprises - Vehicle Spare Parts E-Commerce API"

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY server/package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force
COPY server/ ./
COPY shared/ ../shared/
COPY --from=client-build /app/client/dist ./public

ENV NODE_ENV=production
ENV PORT=5000
USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "index.js"]
