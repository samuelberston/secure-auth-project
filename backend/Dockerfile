FROM node:20-alpine3.19

# Set working directory
WORKDIR /auth-server

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production
RUN npm audit --audit-level=moderate && \
    npm cache clean --force

# Copy application code
COPY --chown=appuser:appgroup . .

# Set ownership and permissions
RUN mkdir logs && \
    chown -R appuser:appgroup /auth-server && \
    chmod -R 550 /auth-server && \
    chmod -R 770 /auth-server/logs && \
    chmod 660 /auth-server/package.json && \
    chmod 660 /auth-server/package-lock.json
    
# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application using node
CMD ["npm", "start"]