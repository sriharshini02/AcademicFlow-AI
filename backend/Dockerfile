# backend/Dockerfile
FROM node:22-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]