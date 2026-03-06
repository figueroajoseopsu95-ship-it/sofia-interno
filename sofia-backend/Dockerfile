# ============================================
# SOFIA Backend — NestJS Production Dockerfile
# ============================================

# --- Stage 1: Install dependencies ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Install openssl BEFORE npm ci so Prisma postinstall detects OpenSSL 3.x
# and downloads the correct engine binary (debian-openssl-3.0.x)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

# --- Stage 2: Build ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
# Verify build output exists
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build" && ls -la dist/ 2>/dev/null && exit 1)

# --- Stage 3: Production ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Only copy what's needed for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main.js"]
