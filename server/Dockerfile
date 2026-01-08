# 1. Use an official Node runtime as a parent image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Build the TypeScript code
RUN npm run build

# 7. Expose the port the app runs on
EXPOSE 5001

# 8. Define the command to run the app
CMD ["npm", "run", "start"]