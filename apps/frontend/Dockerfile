# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
USER 101
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

# Local stack only (docker compose): proxies /api/* like the Kubernetes Ingress
FROM runtime AS compose
COPY nginx/dev-proxy.conf /etc/nginx/conf.d/locations/dev-proxy.conf

# Default target = production image
FROM runtime
