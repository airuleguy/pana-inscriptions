"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const seed_tournaments_1 = require("./utils/seed-tournaments");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            process.env.FRONTEND_URL || 'http://localhost:3000',
        ],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Panamerican Aerobic Gymnastics Tournament API')
        .setDescription('API for registering choreographies in the tournament with FIG integration')
        .setVersion('1.0')
        .addTag('choreographies', 'Choreography registration and management')
        .addTag('gymnasts', 'FIG gymnast database integration')
        .addTag('health', 'Health monitoring endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        customSiteTitle: 'Tournament Registration API',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        await (0, seed_tournaments_1.seedTournaments)(dataSource);
    }
    catch (error) {
        console.error('Failed to seed tournaments:', error);
    }
    const port = configService.get('PORT') || 3001;
    await app.listen(port);
    logger.log(`🚀 Application running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    logger.log(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
}
bootstrap().catch((error) => {
    console.error('❌ Error starting server:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map