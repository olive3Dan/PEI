FROM node:14
WORKDIR /app/server
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]