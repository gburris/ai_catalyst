FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install only server production dependencies
RUN npm ci --workspace=server --omit=dev

# Copy server source
COPY server/src ./server/src

EXPOSE 3001

CMD ["node", "server/src/server.js"]
