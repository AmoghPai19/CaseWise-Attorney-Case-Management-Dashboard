# ---- Stage 1: build the static app ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite reads import.meta.env.VITE_API_URL at BUILD time and bakes it into
# the compiled JS -- it can't be changed at container runtime like a normal
# env var. Pass it in with --build-arg (see docker-compose.yml).
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: serve the build with nginx ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]