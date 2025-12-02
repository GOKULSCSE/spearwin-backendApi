FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --force

# Copy the rest of the project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS project for production
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Start the app in production mode
CMD ["npm", "run", "start:prod"]
