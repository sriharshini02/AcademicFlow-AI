# frontend/Dockerfile

# Stage 1: Build the React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# NOTE: If your build folder is 'build' instead of 'dist', change above line to /app/build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]