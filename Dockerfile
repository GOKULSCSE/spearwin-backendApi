FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --force

# Copy the rest of the project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment variables
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "start"]
