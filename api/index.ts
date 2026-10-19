import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

let cachedServer: any;

async function bootstrap() {
    if (!cachedServer) {
        // Menggunakan Express bawaan internal dari NestJS (tidak perlu install express manual)
        const app = await NestFactory.create(AppModule);

        const corsOrigin = process.env.CORS_ORIGIN || '*';
        app.enableCors({
            origin: corsOrigin === '*' ? true : corsOrigin.split(','),
            credentials: true,
        });

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
        cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer;
}

export default async function handler(req: any, res: any) {
    // Langsung balas 200 OK jika membuka halaman utama '/'
    if (req.url === '/' || req.url === '') {
        return res.status(200).json({
            success: true,
            message: '🚀 SchoolRent Backend API is running smoothly on Vercel!',
            endpoints: {
                items: '/api/items',
                categories: '/api/categories',
                loans: '/api/loans',
                returns: '/api/returns',
                fines: '/api/fines',
                auth_login: '/api/auth/login',
                dashboard: '/api/dashboard/stats',
                reports: '/api/reports/statistics',
            },
        });
    }

    try {
        const server = await bootstrap();
        return server(req, res);
    } catch (error: any) {
        console.error('Vercel Bootstrap Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error?.message || String(error),
            stack: error?.stack,
        });
    }
}
