# ===========================
# Stage 1: Build Stage
# ===========================
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# ===========================
# Stage 2: Production Stage
# ===========================
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY ./ /usr/share/nginx/html

# Remove the default nginx.conf to use a custom configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
