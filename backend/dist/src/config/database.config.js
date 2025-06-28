"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const gymnast_entity_1 = require("../entities/gymnast.entity");
const choreography_entity_1 = require("../entities/choreography.entity");
const tournament_entity_1 = require("../entities/tournament.entity");
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        return {
            type: 'postgres',
            host: this.configService.get('POSTGRES_HOST') || 'localhost',
            port: this.configService.get('POSTGRES_PORT') || 5432,
            username: this.configService.get('POSTGRES_USER'),
            password: this.configService.get('POSTGRES_PASSWORD'),
            database: this.configService.get('POSTGRES_DB'),
            entities: [gymnast_entity_1.Gymnast, choreography_entity_1.Choreography, tournament_entity_1.Tournament],
            synchronize: !isProduction,
            dropSchema: !isProduction,
            logging: !isProduction,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            retryAttempts: 3,
            retryDelay: 3000,
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
const databaseConfig = async (configService) => {
    const config = new DatabaseConfig(configService);
    return config.createTypeOrmOptions();
};
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map