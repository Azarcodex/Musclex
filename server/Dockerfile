# Use a lightweight Node.js base image
FROM node:20-alpine

# Set /app as the working directory inside the container
WORKDIR /app

# Tell Node and libraries that this is a production environment
ENV NODE_ENV=production

# Copy package.json and package-lock.json first
# Enables Docker layer caching for dependencies
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Document the port your app listens on
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
