FROM node:18-alpine
WORKDIR /app
COPY dashboard-ml/backend/package*.json ./
RUN npm install
COPY dashboard-ml/backend/ .
EXPOSE 3001
CMD ["node", "server.js"]
