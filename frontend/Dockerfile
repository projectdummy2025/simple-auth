# Use Node.js LTS Alpine image for build stage
FROM node:20-alpine AS builder

# Set working directory in container
WORKDIR /app

# Copy package files
COPY src/package.json src/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ .

# Build the application
RUN npm run build


# Use nginx to serve the built application
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]