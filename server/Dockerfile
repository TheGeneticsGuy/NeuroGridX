# server/Dockerfile

FROM node:20-alpine
WORKDIR /app

# Change: Copy from the 'server' directory
COPY server/package*.json ./

RUN npm install

# Change: Copy the 'server' directory contents
COPY server/ .

RUN npm run build
EXPOSE 5001
CMD ["npm", "run", "start"]