import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  if (process.env.WEB_URL) {
    allowedOrigins.push(process.env.WEB_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;

  await app.listen(port);

  console.log(`CoffeeFlow API running on http://localhost:${port}/api`);
}

bootstrap();