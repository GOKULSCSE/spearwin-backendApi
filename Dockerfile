FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
ENV PORT=5001
EXPOSE 5001
# test the command
CMD ["npm", "run", "start:prod"]
