# frontend/Dockerfile

# Stage 1: Build the React App
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
# ... (your build stage remains the same)

# Production Stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# ✅ ADD THIS LINE TO COPY YOUR CUSTOM CONFIG:
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]