FROM node:20-alpine as build

WORKDIR /app

# Accept build arguments for Environment Variables
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

# Setting as environment variables during the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]