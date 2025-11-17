FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install bun and dependencies
RUN npm install -g bun && bun install

# Expose port
EXPOSE 5173

# Run the development server with host flag
CMD ["bun", "run", "dev", "--host"]


