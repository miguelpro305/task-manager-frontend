# Stage 1: Build the frontend app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json explicitly
COPY package.json package-lock.json .  
RUN npm install --frozen-lockfile    # Install dependencies

COPY . .                            # Copy the rest of the application code
RUN npm run build                    # Build the frontend app

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built files from the builder stage into Nginx's serving folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Ensure Nginx has appropriate permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose the HTTP port
EXPOSE 80

# Run Nginx as the foreground process
CMD ["nginx", "-g", "daemon off;"]
