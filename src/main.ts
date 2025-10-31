import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Your frontend URL
      'http://localhost:3001', // Alternative frontend port
      'https://admin.spearwin.com',
      'https://admin.spearwin.com/', // With trailing slash
      'https://frontend.spearwin.com',
      'https://frontend.spearwin.com/',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-User-Type',
      'X-User-Email',
      'Cache-Control',
      'Pragma',
      'DNT',
      'Sec-CH-UA',
      'Sec-CH-UA-Mobile',
      'Sec-CH-UA-Platform',
      'User-Agent',
      'Referer',
    ],
    exposedHeaders: ['Authorization', 'X-Total-Count', 'X-Page-Count'],
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
