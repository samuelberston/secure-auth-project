# Use the official Node.js LTS image
FROM node:20-alpine3.19

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package files with correct ownership
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies
RUN npm ci --production
RUN npm audit --audit-level=moderate && \
    npm cache clean --force

# Copy the rest of the application code with correct ownership
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose the frontend port
EXPOSE 80

# Start the Node.js application
CMD ["node", "index.js"]