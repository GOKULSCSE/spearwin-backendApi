import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',  // Your frontend URL
        'http://localhost:3001',  // Alternative frontend port  
        'https://admin.spearwin.com', 
        'https://frontend.spearwin.com'// Production frontend URL
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
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
    exposedHeaders: [
      'Authorization',
      'X-Total-Count',
      'X-Page-Count',
    ],
    credentials: true, // Important for cookies/auth
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Security middleware with CORS-friendly settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Additional CORS headers for better compatibility
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('CORS Debug - Origin:', origin);
    console.log('CORS Debug - Method:', req.method);
    console.log('CORS Debug - Headers:', req.headers);
    
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-User-Type, X-User-Email, Cache-Control, Pragma, DNT, Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, User-Agent, Referer');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      console.log('CORS Debug - Handling OPTIONS preflight request');
      res.status(204).end();
      return;
    }
    
    next();
  });

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
