# ====== STAGE 1: build ======
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Se usar envs tipo import.meta.env.VITE_API_URL
# a gente passa no docker-compose via build args
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ====== STAGE 2: nginx pra servir estático ======
FROM nginx:1.27-alpine

# Remove config default
RUN rm /etc/nginx/conf.d/default.conf

# Nossa config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
