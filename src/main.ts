import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('SchoolRentBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS Configuration
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // 2. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 3. Global Exception Filter & Transform Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 4. Swagger API Documentation (Kontrak API untuk Frontend Next.js)
  const config = new DocumentBuilder()
    .setTitle('SchoolRent API')
    .setDescription(
      'REST API Backend untuk Sistem Peminjaman Barang & Fasilitas Sekolah (SchoolRent) berbasis NestJS dan Supabase. Lengkap dengan otentikasi JWT, role SISWA, PETUGAS, ADMIN, persetujuan pinjaman, pengembalian otomatis, kalkulasi denda, notifikasi, dan laporan.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Masukkan JWT Token Anda di sini (Format: Bearer <token>)',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SchoolRent REST API Docs',
  });

  // 5. Start Server
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 SchoolRent Backend API berjalan di: http://localhost:${port}`);
  logger.log(`📑 Dokumentasi Swagger API aktif di: http://localhost:${port}/api/docs`);
}
bootstrap();
