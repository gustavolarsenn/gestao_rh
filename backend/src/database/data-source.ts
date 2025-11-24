import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const isProd = process.env.NODE_ENV === 'production';
const isSsl = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  synchronize: process.env.NODE_ENV !== 'production',
  entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isProd
    ? ['dist/database/migrations/*.{js}']
    : ['src/database/migrations/*.{ts,js}'],

  logging: ['error', 'warn'],
});