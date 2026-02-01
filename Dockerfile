# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js ./
COPY src/ src/
COPY public/ public/

# Build frontend
RUN npm run build


# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package.json server/package-lock.json* ./

# Install server dependencies (including dev for tsc)
RUN npm ci

# Copy server source
COPY server/ ./

# Build server
RUN npm run build


# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for server
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy built backend
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/db ./db

# Copy built frontend to be served by backend
COPY --from=frontend-builder /app/dist ../dist

# Create data directory for SQLite
RUN mkdir -p /data

WORKDIR /app/server

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_DIR=/data

# Start the server
CMD ["node", "dist/index.js"]
