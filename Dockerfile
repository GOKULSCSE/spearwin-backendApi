FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --force

# Copy source code
COPY . .

# Build the NestJS project inside the image so that /dist is always up to date
RUN npm run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Run the compiled app
CMD ["npm", "run", "start:prod"]
