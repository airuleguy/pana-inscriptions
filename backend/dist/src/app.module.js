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
const jwt_1 = require("@nestjs/jwt");
const config_2 = require("./config/config");
const database_config_1 = require("./config/database.config");
const gymnast_entity_1 = require("./entities/gymnast.entity");
const choreography_entity_1 = require("./entities/choreography.entity");
const tournament_entity_1 = require("./entities/tournament.entity");
const coach_entity_1 = require("./entities/coach.entity");
const judge_entity_1 = require("./entities/judge.entity");
const user_entity_1 = require("./entities/user.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const choreography_controller_1 = require("./controllers/choreography.controller");
const gymnast_controller_1 = require("./controllers/gymnast.controller");
const tournament_controller_1 = require("./controllers/tournament.controller");
const coach_controller_1 = require("./controllers/coach.controller");
const judge_controller_1 = require("./controllers/judge.controller");
const tournament_registrations_controller_1 = require("./controllers/tournament-registrations.controller");
const registrations_controller_1 = require("./controllers/registrations.controller");
const health_controller_1 = require("./modules/health/health.controller");
const fig_image_proxy_controller_1 = require("./controllers/fig-image-proxy.controller");
const auth_controller_1 = require("./controllers/auth.controller");
const choreography_service_1 = require("./services/choreography.service");
const tournament_service_1 = require("./services/tournament.service");
const coach_registration_service_1 = require("./services/coach-registration.service");
const judge_registration_service_1 = require("./services/judge-registration.service");
const batch_registration_service_1 = require("./services/batch-registration.service");
const fig_api_service_1 = require("./services/fig-api.service");
const fig_image_proxy_service_1 = require("./services/fig-image-proxy.service");
const gymnast_service_1 = require("./services/gymnast.service");
const auth_service_1 = require("./services/auth.service");
const jwt_service_1 = require("./services/jwt.service");
const auth_guard_1 = require("./guards/auth.guard");
const business_rules_factory_1 = require("./utils/business-rules/business-rules-factory");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.configuration],
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_1.DatabaseConfig,
            }),
            typeorm_1.TypeOrmModule.forFeature([gymnast_entity_1.Gymnast, choreography_entity_1.Choreography, tournament_entity_1.Tournament, coach_entity_1.Coach, judge_entity_1.Judge, user_entity_1.User, user_session_entity_1.UserSession]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => configService.get('jwt'),
                inject: [config_1.ConfigService],
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => configService.get('cache'),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [
            choreography_controller_1.ChoreographyController,
            gymnast_controller_1.GymnastController,
            tournament_controller_1.TournamentController,
            coach_controller_1.CoachController,
            judge_controller_1.JudgeController,
            tournament_registrations_controller_1.TournamentRegistrationsController,
            registrations_controller_1.GlobalRegistrationsController,
            fig_image_proxy_controller_1.FigImageProxyController,
            auth_controller_1.AuthController,
            health_controller_1.HealthController,
        ],
        providers: [
            choreography_service_1.ChoreographyService,
            tournament_service_1.TournamentService,
            coach_registration_service_1.CoachRegistrationService,
            judge_registration_service_1.JudgeRegistrationService,
            batch_registration_service_1.BatchRegistrationService,
            fig_api_service_1.FigApiService,
            fig_image_proxy_service_1.FigImageProxyService,
            gymnast_service_1.GymnastService,
            auth_service_1.AuthService,
            jwt_service_1.JwtService,
            auth_guard_1.AuthGuard,
            business_rules_factory_1.BusinessRulesFactory,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map