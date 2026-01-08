FROM node:20-alpine as build

WORKDIR /app

# Accept build arguments for Environment Variables
# (Vite requires these at BUILD time, not runtime)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set them as environment variables during the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# Copy the build output from Stage 1 to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy  custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]