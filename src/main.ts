import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3001'  // Alternative frontend port
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Important for cookies/auth
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Security middleware with CORS-friendly settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
