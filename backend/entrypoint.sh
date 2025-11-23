#!/bin/sh
set -e

echo "⏳ Aguardando Postgres em ${DB_HOST:-db}:${DB_PORT:-5432}..."

# espera o Postgres ficar acessível
until nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

echo "✅ Postgres está no ar, rodando migrations..."

npm run migrations:run:prod

echo "🚀 Subindo NestJS (start:prod)..."

npm run start:prod
