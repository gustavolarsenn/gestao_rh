#!/bin/sh
set -e

echo "⏳ Aguardando Postgres em ${DB_HOST:-db}:${DB_PORT:-5432}..."

# Espera o Postgres ficar acessível
until nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

echo "✅ Postgres está no ar!"

# Verifica se existem migrations pendentes
echo "🔍 Verificando migrations..."
MIGRATIONS_OUTPUT=$(npm run migrations:run:prod 2>&1 || true)
echo "$MIGRATIONS_OUTPUT"

# Se não houver migrations (tabelas não existem), gera automaticamente
if echo "$MIGRATIONS_OUTPUT" | grep -q "No migrations are pending"; then
  echo "📝 Gerando migration inicial automaticamente..."
  
  # Força sincronização para criar o schema
  NODE_ENV=production node -e "
    const dataSource = require('./dist/database/data-source').default;
    dataSource.options.synchronize = true;
    dataSource.initialize()
      .then(() => {
        console.log('✅ Schema criado via synchronize');
        return dataSource.destroy();
      })
      .then(() => process.exit(0))
      .catch(err => {
        console.error('❌ Erro:', err);
        process.exit(1);
      });
  " || {
    echo "❌ Falha ao criar schema"
    exit 1
  }
fi

echo "🚀 Subindo NestJS (start:prod)..."
npm run start:prod