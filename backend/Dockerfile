FROM node:20-alpine

WORKDIR /app

# 1. Copia pacotes e instala deps (sem dev)
COPY package*.json ./
RUN npm ci --omit=dev

# 2. Copia o código
COPY . .

# 3. Build do NestJS
RUN npm run build

# 4. Ferramenta pra checar porta (nc)
RUN apk add --no-cache netcat-openbsd

# 5. Entrypoint customizado
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
