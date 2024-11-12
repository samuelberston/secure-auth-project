# Use the official Nginx image
FROM nginx:stable-alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy your static frontend files to the Nginx HTML directory
COPY public/ /usr/share/nginx/html/

# Optional: Add a custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
