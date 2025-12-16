# Use Node.js LTS Alpine image for smaller size
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package files from the src directory
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY src/ .

# Expose port
EXPOSE 8000

# Define environment variables
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["npm", "run", "dev"]