FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002
EXPOSE 8080

CMD ["node", "server/server_restructured.js"]
