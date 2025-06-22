# Use Node.js 18 Alpine for smaller image size
FROM --platform=linux/amd64 node:18-alpine

# Install Git (required for Git operations)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and clean cache in same layer to save space
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Create data directory for content storage
RUN mkdir -p data/content

# Build the Next.js application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port that Cloud Run expects
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["npm", "start"] 