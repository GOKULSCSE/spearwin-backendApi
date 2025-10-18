FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
ENV PORT=5000
EXPOSE 5000
# test the command
CMD ["npm", "run", "start:prod"]
