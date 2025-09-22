import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // Opcional: log do endereço
  const url = await app.getUrl();
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running at ${url}`);
}
bootstrap();