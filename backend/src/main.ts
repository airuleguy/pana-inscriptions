import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { seedTournaments } from './utils/seed-tournaments';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Temporarily disabled for debugging
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Serve static files from uploads directory in development
  if (process.env.NODE_ENV === 'development') {
    app.use('/uploads', express.static('uploads'));
  }

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend development
      'http://localhost:3001', // Backend development
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Panamerican Aerobic Gymnastics Tournament API')
    .setDescription('API for registering choreographies in the tournament with FIG integration')
    .setVersion('1.0')
    .addTag('choreographies', 'Choreography registration and management')
    .addTag('gymnasts', 'FIG gymnast database integration')
    .addTag('health', 'Health monitoring endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Tournament Registration API',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Seed tournaments on startup
  try {
    const dataSource = app.get(DataSource);
    await seedTournaments(dataSource);
  } catch (error) {
    console.error('Failed to seed tournaments:', error);
  }

  // Start server
  const port = configService.get<number>('port');
  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
}); 