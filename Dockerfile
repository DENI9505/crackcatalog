FROM node:20-slim

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm install typescript --no-save
COPY . .
RUN npm run build

ENV PORT=8081
EXPOSE 8081

CMD ["node", "dist/server.js"]
