# Use the official Node.js LTS image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the frontend port
EXPOSE 80

# Start the Node.js application
CMD ["node", "index.js"]