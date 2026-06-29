# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY client/ ./
RUN npm run build

# Stage 2: Production backend with built frontend
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY . .

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "./bin/www"]
