FROM node:20-alpine
CMD ["bun", "run", "dev", "--host"]
# Run the development server

EXPOSE 5173
# Expose port

COPY . .
# Copy application code

RUN npm install -g bun && bun install
# Install dependencies

COPY package.json bun.lock* ./
# Copy package files

WORKDIR /app


