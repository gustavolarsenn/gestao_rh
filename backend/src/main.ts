import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const extraOriginsRaw = configService.get<string>('CORS_EXTRA_ORIGINS') || '';

  const extraOrigins = extraOriginsRaw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  let allowedOrigins: (string | RegExp)[] = [];

  if (nodeEnv === 'development') {
    // Dev local
    allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
  } else {
    // Produção
    allowedOrigins = [
      ...(frontendUrl ? [frontendUrl] : []),
      ...extraOrigins,
    ];
  }

  app.setGlobalPrefix('api', { exclude: ['/metrics'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // se usar cookies; se só header Authorization, pode deixar true sem problema
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
