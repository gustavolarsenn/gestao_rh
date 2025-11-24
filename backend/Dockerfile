FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN apk add --no-cache netcat-openbsd

CMD sh -c ' \
  echo "⏳ Aguardando Postgres..." && \
  until nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do sleep 1; done && \
  echo "✅ Postgres no ar!" && \
  echo "🔧 Modo desenvolvimento - usando synchronize" && \
  echo "🚀 Subindo NestJS..." && \
  npm run start:prod \
'