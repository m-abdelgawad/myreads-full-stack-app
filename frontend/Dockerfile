# ──────────────── Stage 1 – compile SPA assets ────────────────
FROM node:20-alpine AS builder
WORKDIR /opt/web
COPY package*.json ./
RUN npm ci
COPY . .
# Runtime API endpoint baked at build-time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build            # outputs to /opt/web/dist

# ──────────────── Stage 2 –   ultra-slim web server ───────────
FROM nginx:1.27-alpine
COPY --from=builder /opt/web/dist /usr/share/nginx/html
# Optional: Single-page-app history-fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
