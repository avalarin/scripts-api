# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV CONFIG_PATH=/app/config.json

# Start the server
CMD ["node", "dist/index.js"] 