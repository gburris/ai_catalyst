FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install client dependencies
RUN npm ci --workspace=client

# Copy client source and config
COPY client/src ./client/src
COPY client/index.html ./client/
COPY client/vite.config.js ./client/

# Build the static assets
RUN npm run build --workspace=client


FROM nginx:1.27-alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
