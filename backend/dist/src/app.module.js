"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const database_config_1 = require("./config/database.config");
const gymnast_entity_1 = require("./entities/gymnast.entity");
const choreography_entity_1 = require("./entities/choreography.entity");
const choreography_controller_1 = require("./controllers/choreography.controller");
const gymnast_controller_1 = require("./controllers/gymnast.controller");
const health_controller_1 = require("./modules/health/health.controller");
const choreography_service_1 = require("./services/choreography.service");
const fig_api_service_1 = require("./services/fig-api.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_1.DatabaseConfig,
            }),
            typeorm_1.TypeOrmModule.forFeature([gymnast_entity_1.Gymnast, choreography_entity_1.Choreography]),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 3600,
                max: 100,
            }),
        ],
        controllers: [
            choreography_controller_1.ChoreographyController,
            gymnast_controller_1.GymnastController,
            health_controller_1.HealthController,
        ],
        providers: [
            choreography_service_1.ChoreographyService,
            fig_api_service_1.FigApiService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map