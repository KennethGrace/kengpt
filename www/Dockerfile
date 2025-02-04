# Build Stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY app .
RUN npm ci
RUN npm run build

# Deploy Stage (Caddy)
FROM caddy:latest
ENV API_URI=http://localhost:8080
WORKDIR /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /app/dist ./dist
COPY public .