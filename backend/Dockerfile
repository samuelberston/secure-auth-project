FROM node:20-alpine 

# Set working directory
WORKDIR /auth-server

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy application code
COPY . .

# Set ownership and permissions
RUN chown -R appuser:appgroup /auth-server && \
    mkdir logs && \
    chown -R appuser:appgroup /auth-server/logs

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application using node
CMD ["npm", "start"]