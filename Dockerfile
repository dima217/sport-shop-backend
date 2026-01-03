FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application with verbose output
RUN echo "Starting build..." && \
    yarn build && \
    echo "Build completed. Checking output..." && \
    ls -la dist/ && \
    if [ ! -f "dist/src/main.js" ]; then \
      echo "ERROR: dist/src/main.js not found!" && \
      echo "Looking for main files:" && \
      find dist -name "main*" -type f || echo "No main files found" && \
      exit 1; \
    fi && \
    echo "Build verification successful!"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/src/main.js"]
