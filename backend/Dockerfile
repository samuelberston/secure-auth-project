# ===========================
# Stage 1: Build Stage
# ===========================
FROM node:16-alpine AS build

# Set working directory
WORKDIR /auth-server

# Install dependencies
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Copy application code
COPY . .

# ===========================
# Stage 2: Production Stage
# ===========================
FROM node:16-alpine

# Set working directory
WORKDIR /auth-server

# Copy only the necessary files from the build stage
COPY --from=build /auth-server /auth-server

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable for production
ENV NODE_ENV=production

# Start the application using node
CMD ["node", "index.js"]