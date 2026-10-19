import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Konfigurasi CORS
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    app.enableCors({
      origin: corsOrigin === '*' ? true : corsOrigin.split(','),
      credentials: true,
    });

    // Global Pipes & Filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  }
  return server;
}

// Route default agar halaman utama Vercel tidak error saat dibuka
server.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SchoolRent Backend API is running smoothly on Vercel!',
    endpoints: {
      auth_login: '/api/auth/login',
      auth_register: '/api/auth/register',
      items: '/api/items',
      categories: '/api/categories',
      loans: '/api/loans',
      returns: '/api/returns',
      fines: '/api/fines',
      dashboard: '/api/dashboard/stats',
      reports: '/api/reports/statistics',
    },
  });
});

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();
    server(req, res);
  } catch (error: any) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Gagal menjalankan serverless backend NestJS di Vercel',
      error: error?.message || String(error),
      stack: error?.stack,
    });
  }
}
